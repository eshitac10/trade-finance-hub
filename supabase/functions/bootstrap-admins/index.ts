import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const admins = [
      { email: 'its.priyo', password: 'Priyanka007' },
      { email: 'pproy1956@gmail.com', password: 'Pinaki1956' }
    ]

    const results = []

    for (const admin of admins) {
      console.log('Processing admin:', admin.email)
      
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users.find(u => u.email === admin.email)

      let userId: string

      if (existingUser) {
        console.log('User already exists:', admin.email)
        userId = existingUser.id
        
        // Update password
        await supabaseAdmin.auth.admin.updateUserById(userId, { password: admin.password })
      } else {
        console.log('Creating new user:', admin.email)
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true,
        })

        if (createError) {
          console.error('Error creating user:', createError)
          results.push({ email: admin.email, error: createError.message })
          continue
        }

        userId = newUser.user.id
      }

      // Check if admin role already exists
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single()

      if (!existingRole) {
        console.log('Assigning admin role to:', admin.email)
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' })

        if (roleError) {
          console.error('Error assigning admin role:', roleError)
          results.push({ email: admin.email, error: roleError.message })
          continue
        }
      }

      results.push({ email: admin.email, success: true })
    }

    console.log('Bootstrap complete:', results)

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})