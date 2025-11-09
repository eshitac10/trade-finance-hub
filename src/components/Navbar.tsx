import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Youtube, LogIn, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
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

  const handleSocialClick = (platform: string) => {
    const urls = {
      youtube: "https://youtube.com/playlist?list=PL1Pevhekc6MWqRwA5XEfqkL3LP-LLJl9X&si=rEph3hnc-p6N4V-t",
    };
    const url = urls[platform as keyof typeof urls];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <nav className="bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-soft sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Show full navigation only when authenticated */}
          {isAuthenticated ? (
            <>
              {/* Navigation Menu */}
              <div className="hidden md:flex items-center space-x-1">
                {/* Home Button */}
                <Button
                  variant="ghost"
                  className="banking-text text-foreground/80 hover:text-primary font-medium px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                  onClick={() => navigate("/")}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>

                {/* Forum Link */}
                <Button
                  variant="ghost"
                  className="banking-text text-foreground/80 hover:text-primary font-medium px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                  onClick={() => navigate("/forum")}
                >
                  Forum
                </Button>

                {/* Resources Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="banking-text text-foreground/80 hover:text-primary flex items-center space-x-1 font-medium px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                    >
                      <span>Resources</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-card/98 backdrop-blur-xl border border-border/60 shadow-elegant z-50 rounded-xl p-2">
                    <DropdownMenuItem className="banking-text hover:bg-primary-light/30 cursor-pointer focus:bg-primary-light/30 rounded-lg px-3 py-2.5 transition-all">
                      Member Important Conversations
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="banking-text hover:bg-primary-light/30 cursor-pointer focus:bg-primary-light/30 rounded-lg px-3 py-2.5 transition-all"
                      onClick={() => navigate("/member-articles")}
                    >
                      Member Articles
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="banking-text hover:bg-primary-light/30 cursor-pointer focus:bg-primary-light/30 rounded-lg px-3 py-2.5 transition-all"
                      onClick={() => navigate("/submit-document")}
                    >
                      Submit a Document
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Upcoming Events Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="banking-text text-foreground/80 hover:text-primary flex items-center space-x-1 font-medium px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                    >
                      <span>Upcoming Events</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-card/98 backdrop-blur-xl border border-border/60 shadow-elegant z-50 rounded-xl p-2">
                    <DropdownMenuItem 
                      className="banking-text hover:bg-primary-light/30 cursor-pointer focus:bg-primary-light/30 rounded-lg px-3 py-2.5 transition-all"
                      onClick={() => navigate("/webinars")}
                    >
                      Webinars
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="banking-text hover:bg-primary-light/30 cursor-pointer focus:bg-primary-light/30 rounded-lg px-3 py-2.5 transition-all"
                      onClick={() => navigate("/events")}
                    >
                      Upcoming TFW Events
                    </DropdownMenuItem>
                    <DropdownMenuItem className="banking-text hover:bg-primary-light/30 cursor-pointer focus:bg-primary-light/30 rounded-lg px-3 py-2.5 transition-all">
                      Other Events
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Members Link */}
                <Button
                  variant="ghost"
                  className="banking-text text-foreground/80 hover:text-primary font-medium px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                  onClick={() => navigate("/members")}
                >
                  Members
                </Button>

                {/* Social Media Icons */}
                <div className="flex items-center space-x-2 ml-6 pl-6 border-l border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary p-2.5 hover:bg-primary-light/30 rounded-lg transition-all hover:scale-110"
                    onClick={() => handleSocialClick("youtube")}
                    aria-label="Open YouTube playlist"
                  >
                    <Youtube className="h-5 w-5" />
                  </Button>
                </div>

                {/* Logout Button */}
                <div className="flex items-center ml-4 pl-4 border-l border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="banking-text text-foreground/80 hover:text-destructive font-medium px-4 py-2 rounded-lg hover:bg-destructive/10 transition-all hover:scale-105"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Login and Signup buttons when not authenticated - Centered */
            <div className="flex items-center justify-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="banking-text text-foreground/80 hover:text-primary font-semibold px-6 py-5 rounded-xl hover:bg-primary-light/30 transition-all hover:scale-105"
                onClick={() => navigate("/auth")}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button
                size="sm"
                className="banking-text bg-gradient-primary hover:shadow-accent text-primary-foreground font-semibold px-8 py-5 rounded-xl transition-all hover:scale-105"
                onClick={() => navigate("/auth")}
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="p-2">
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;