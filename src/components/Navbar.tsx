import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Sun, Moon, Menu, ChevronDown, Shield, User, Lock, Edit, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";


interface NavbarProps {
  onLoginClick?: () => void;
}

const Navbar = ({ onLoginClick }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
        
        setIsAdmin(!!roleData);
        
        // Fetch user's full name
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        
        setUserName(profileData?.full_name || "");
      } else {
        setIsAdmin(false);
        setUserName("");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session);
      
      if (session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
        
        setIsAdmin(!!roleData);
        
        // Fetch user's full name
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        
        setUserName(profileData?.full_name || "");
      } else {
        setIsAdmin(false);
        setUserName("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const handleSocialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return (
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {isAuthenticated ? (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center justify-center flex-1 space-x-1">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="banking-text font-bold text-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                >
                  Home
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="banking-text font-bold text-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    >
                      <User className="mr-1 h-4 w-4" />
                      Account
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-background border-border">
                    {isAdmin && (
                      <DropdownMenuItem
                        onClick={() => navigate("/admin")}
                        className="cursor-pointer hover:bg-accent/10"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => navigate("/security")}
                      className="cursor-pointer hover:bg-accent/10"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Security
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/edit-profile")}
                      className="cursor-pointer hover:bg-accent/10"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/statistics")}
                      className="cursor-pointer hover:bg-accent/10"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Statistics
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="banking-text font-bold text-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    >
                      Resources
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-card backdrop-blur-xl border-border shadow-premium z-50 min-w-[240px] p-2">
                    <DropdownMenuItem 
                      onClick={() => navigate("/articles")}
                      className="banking-text cursor-pointer rounded-lg px-4 py-3 text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 focus:bg-accent/10 focus:text-accent"
                    >
                      Articles
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate("/chat-import")}
                      className="banking-text cursor-pointer rounded-lg px-4 py-3 text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 focus:bg-accent/10 focus:text-accent"
                    >
                      Member Conversations
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate("/memories")}
                      className="banking-text cursor-pointer rounded-lg px-4 py-3 text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 focus:bg-accent/10 focus:text-accent"
                    >
                      Memories
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="banking-text font-bold text-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    >
                      Events
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-card backdrop-blur-xl border-border shadow-premium z-50 min-w-[240px] p-2">
                    <DropdownMenuItem 
                      onClick={() => navigate("/webinars")}
                      className="banking-text cursor-pointer rounded-lg px-4 py-3 text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 focus:bg-accent/10 focus:text-accent"
                    >
                      TFW Past Webinars
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate("/events")}
                      className="banking-text cursor-pointer rounded-lg px-4 py-3 text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 focus:bg-accent/10 focus:text-accent"
                    >
                      Upcoming Webinars/Events
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-4">
                {userName && (
                  <span className="banking-text font-medium text-foreground">
                    Hello, {userName}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-border hover:bg-accent/10 banking-text font-bold"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-foreground">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-64 bg-background/95 backdrop-blur-xl border-border">
                    <div className="flex flex-col space-y-4 mt-8">
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/dashboard")}
                        className="justify-start banking-text font-bold text-foreground hover:text-accent hover:bg-accent/10"
                      >
                        Home
                      </Button>
                       <div className="space-y-2">
                        <p className="text-muted-foreground text-xs px-3 font-bold">Resources</p>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/articles")}
                          className="justify-start w-full banking-text text-foreground hover:text-accent hover:bg-accent/10 pl-6"
                        >
                          Articles
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/chat-import")}
                          className="justify-start w-full banking-text text-foreground hover:text-accent hover:bg-accent/10 pl-6"
                        >
                          Member Important Conversations
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/memories")}
                          className="justify-start w-full banking-text text-foreground hover:text-accent hover:bg-accent/10 pl-6"
                        >
                          Memories
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-xs px-3 font-bold">Account</p>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            onClick={() => navigate("/admin")}
                            className="justify-start w-full banking-text text-foreground hover:text-accent hover:bg-accent/10 pl-6"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/security")}
                          className="justify-start w-full banking-text text-foreground hover:text-accent hover:bg-accent/10 pl-6"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Security
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/edit-profile")}
                          className="justify-start w-full banking-text text-foreground hover:text-accent hover:bg-accent/10 pl-6"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/statistics")}
                          className="justify-start w-full banking-text text-foreground hover:text-accent hover:bg-accent/10 pl-6"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Statistics
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-xs px-3 font-bold">Events</p>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/webinars")}
                          className="justify-start w-full banking-text text-foreground hover:text-accent hover:bg-accent/10 pl-6"
                        >
                          TFW Past Webinars
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/events")}
                          className="justify-start w-full banking-text text-foreground hover:text-accent hover:bg-accent/10 pl-6"
                        >
                          Upcoming Webinars/Events
                        </Button>
                      </div>
                      <div className="border-t border-border pt-4">
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          className="w-full mt-4 border-border hover:bg-accent/10 banking-text font-bold"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : (
            <>
              {/* Unauthenticated - Login centered with theme toggle on right */}
              <div className="hidden md:flex items-center justify-center flex-1">
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  className="border-[#C9A961] text-[#C9A961] hover:bg-[#C9A961]/20 banking-text font-bold"
                >
                  Login
                </Button>
              </div>

              <div className="hidden md:flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 transition-colors"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>

              {/* Mobile - Unauthenticated */}
              <div className="md:hidden flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-foreground">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-64 bg-background/95 backdrop-blur-xl border-border">
                    <div className="flex flex-col space-y-4 mt-8">
                      <Button
                        onClick={() => navigate("/auth")}
                        variant="outline"
                        className="border-border hover:bg-accent/10 banking-text font-bold w-full"
                      >
                        Login
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
