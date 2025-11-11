import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status and redirect if logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-52 h-52 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float" />
      </div>

      <div className="relative text-center space-y-8 max-w-2xl animate-fade-in">
        <h1 className="professional-heading text-4xl sm:text-5xl md:text-6xl text-primary mb-6">
          Welcome to Trade Finance World
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Join our premier knowledge-sharing platform for trade finance professionals
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-gradient-primary hover:shadow-elegant text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl transition-all hover:scale-105 group btn-premium"
          >
            <span className="flex items-center">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

