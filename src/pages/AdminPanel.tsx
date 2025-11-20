import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Users, Shield, KeyRound, Copy, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  created_at: string;
  role: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({ email: "", password: "" });
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
  const [manageRoleDialogOpen, setManageRoleDialogOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setCurrentUserEmail(session.user.email || "");

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadUsers();
    } catch (error) {
      console.error('Admin check error:', error);
      setLoading(false);
      navigate("/");
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("list-users", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Load users error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load users",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !newPassword || !newFullName) {
      toast({
        title: "Validation Error",
        description: "Please provide email, password, and full name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { 
          email: newEmail, 
          password: newPassword,
          full_name: newFullName,
          mobile_number: newMobile
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${newEmail} created successfully`,
      });

      setNewEmail("");
      setNewPassword("");
      setNewFullName("");
      setNewMobile("");
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleResetPasswordConfirm = (userId: string, email: string) => {
    setSelectedUser({ id: userId, email });
    setResetPasswordDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("reset-user-password", {
        body: { userId: selectedUser.id },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      setResetPasswordData({ email: selectedUser.email, password: data.newPassword });
      setResetPasswordDialogOpen(false);
      setShowPasswordDialog(true);
      setPasswordCopied(false);

      toast({
        title: "Success",
        description: `Password reset for ${selectedUser.email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(resetPasswordData.password);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Password copied to clipboard",
    });
  };

  const handleDeleteUserConfirm = (userId: string, email: string) => {
    setSelectedUser({ id: userId, email });
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId: selectedUser.id },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${selectedUser.email} deleted successfully`,
      });

      setDeleteDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleManageRole = (user: User) => {
    setSelectedUserForRole(user);
    setManageRoleDialogOpen(true);
  };

  const handleToggleAdmin = async (makeAdmin: boolean) => {
    if (!selectedUserForRole) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (makeAdmin) {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedUserForRole.id,
            role: 'admin'
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: `${selectedUserForRole.email} is now an admin`,
        });
      } else {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUserForRole.id)
          .eq('role', 'admin');

        if (error) throw error;

        toast({
          title: "Success",
          description: `Admin access removed from ${selectedUserForRole.email}`,
        });
      }

      setManageRoleDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  if (loading && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2 text-foreground">
            <Shield className="h-10 w-10 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Plus className="h-5 w-5" />
                Create New User
              </CardTitle>
              <CardDescription className="text-muted-foreground">Add a new user to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="+1234567890"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5" />
                User Statistics
              </CardTitle>
              <CardDescription className="text-muted-foreground">Overview of system users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                  <span className="text-sm font-medium text-foreground">Total Users</span>
                  <span className="text-2xl font-bold text-foreground">{users.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border">
                  <span className="text-sm font-medium text-foreground">Admin Users</span>
                  <span className="text-2xl font-bold text-foreground">
                    {users.filter(u => u.role === 'admin').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5" />
              All Users
            </CardTitle>
            <CardDescription className="text-muted-foreground">Manage existing user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageRole(user)}
                        title="Manage admin access"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPasswordConfirm(user.id, user.email)}
                        title="Reset password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUserConfirm(user.id, user.email)}
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset Successful</DialogTitle>
            <DialogDescription>
              New password has been generated for {resetPasswordData.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="text-sm font-medium mb-2 text-foreground">New Password:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded border border-border text-sm font-mono text-foreground">
                  {resetPasswordData.password}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPasswordToClipboard}
                >
                  {passwordCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                <strong>Important:</strong> Copy this password and share it with the user securely. 
                It cannot be retrieved again.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete <strong>{selectedUser?.email}</strong>? 
              This action cannot be undone and will permanently delete the user's account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Reset Password</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to reset the password for <strong>{selectedUser?.email}</strong>? 
              A new random password will be generated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Reset Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manage Admin Role Dialog */}
      <AlertDialog open={manageRoleDialogOpen} onOpenChange={setManageRoleDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Manage Admin Access
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              <strong>{selectedUserForRole?.email}</strong> is currently 
              {selectedUserForRole?.role === 'admin' ? ' an admin' : ' not an admin'}. 
              What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            {selectedUserForRole?.role === 'admin' ? (
              <AlertDialogAction
                onClick={() => handleToggleAdmin(false)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove Admin Access
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={() => handleToggleAdmin(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Make Admin
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;