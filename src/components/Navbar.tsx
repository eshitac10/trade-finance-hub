import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Youtube, LogIn, LogOut, Home, Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NavbarProps {
  onLoginClick?: () => void;
}

const Navbar = ({ onLoginClick }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

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
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo/Title - Centered */}
          <div className="flex-1 flex justify-center">
            <h1 className="professional-heading text-2xl font-bold text-primary">Trade Finance World</h1>
          </div>

          {/* Desktop Navigation - Centered */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center justify-center space-x-1 flex-1">
              <Button
                variant="ghost"
                className="banking-text text-foreground/80 hover:text-primary font-bold px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                onClick={() => navigate("/dashboard")}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>

              <Button
                variant="ghost"
                className="banking-text text-foreground/80 hover:text-primary font-bold px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                onClick={() => navigate("/articles")}
              >
                Articles
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="banking-text text-foreground/80 hover:text-primary flex items-center space-x-1 font-bold px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                  >
                    <span>Resources</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-card/98 backdrop-blur-xl border border-border/60 shadow-elegant z-50 rounded-xl p-2">
                  <DropdownMenuItem
                    className="banking-text hover:bg-primary-light/30 cursor-pointer focus:bg-primary-light/30 rounded-lg px-3 py-2.5 transition-all"
                    onClick={() => navigate("/submit-document")}
                  >
                    Submit a Document
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="banking-text hover:bg-primary-light/30 cursor-pointer focus:bg-primary-light/30 rounded-lg px-3 py-2.5 transition-all"
                    onClick={() => navigate("/chat-import")}
                  >
                    Member Important Conversations
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="banking-text text-foreground/80 hover:text-primary flex items-center space-x-1 font-bold px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                  >
                    <span>Events</span>
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
                    Events
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          )}

          {/* Right Side - YouTube & Theme & Logout */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-2 flex-1 justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary p-2.5 hover:bg-primary-light/30 rounded-lg transition-all hover:scale-110"
                onClick={() => handleSocialClick("youtube")}
                aria-label="Open YouTube playlist"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 hover:bg-primary-light/30 rounded-lg transition-all hover:scale-110"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-primary" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="banking-text text-foreground/80 hover:text-destructive font-bold px-4 py-2 rounded-lg hover:bg-destructive/10 transition-all hover:scale-105"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}

          {/* Mobile Menu - Only for authenticated users */}
          {isAuthenticated && (
            <div className="md:hidden flex items-center flex-1">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] bg-background/98 backdrop-blur-xl">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Button
                      variant="ghost"
                      className="banking-text justify-start text-foreground/80 hover:text-primary font-medium px-4 py-3 rounded-lg hover:bg-primary-light/30 transition-all"
                      onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}
                    >
                      <Home className="h-5 w-5 mr-3" />
                      Home
                    </Button>

                    <Button
                      variant="ghost"
                      className="banking-text justify-start text-foreground/80 hover:text-primary font-medium px-4 py-3 rounded-lg hover:bg-primary-light/30 transition-all"
                      onClick={() => { navigate("/articles"); setMobileMenuOpen(false); }}
                    >
                      Articles
                    </Button>

                    <div className="pl-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resources</p>
                      <Button
                        variant="ghost"
                        className="banking-text w-full justify-start text-foreground/80 hover:text-primary font-medium px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                        onClick={() => { navigate("/submit-document"); setMobileMenuOpen(false); }}
                      >
                        Submit a Document
                      </Button>
                      <Button
                        variant="ghost"
                        className="banking-text w-full justify-start text-foreground/80 hover:text-primary font-medium px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                        onClick={() => { navigate("/chat-import"); setMobileMenuOpen(false); }}
                      >
                        Important Conversations
                      </Button>
                    </div>

                    <div className="pl-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Events</p>
                      <Button
                        variant="ghost"
                        className="banking-text w-full justify-start text-foreground/80 hover:text-primary font-medium px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                        onClick={() => { navigate("/webinars"); setMobileMenuOpen(false); }}
                      >
                        Webinars
                      </Button>
                      <Button
                        variant="ghost"
                        className="banking-text w-full justify-start text-foreground/80 hover:text-primary font-medium px-4 py-2 rounded-lg hover:bg-primary-light/30 transition-all"
                        onClick={() => { navigate("/events"); setMobileMenuOpen(false); }}
                      >
                        Events
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="banking-text justify-start text-foreground/80 hover:text-destructive font-medium px-4 py-3 rounded-lg hover:bg-destructive/10 transition-all"
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* Login/Signup buttons when not authenticated */}
          {!isAuthenticated && (
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="banking-text text-foreground/80 hover:text-primary font-bold px-3 sm:px-6 py-3 sm:py-5 text-sm sm:text-base rounded-xl hover:bg-primary-light/30 transition-all hover:scale-105"
                onClick={onLoginClick}
              >
                <LogIn className="h-4 w-4 mr-1 sm:mr-2" />
                Login
              </Button>
              <Button
                size="sm"
                className="banking-text bg-gradient-primary hover:shadow-accent text-primary-foreground font-bold px-4 sm:px-8 py-3 sm:py-5 text-sm sm:text-base rounded-xl transition-all hover:scale-105"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="p-2.5 rounded-lg hover:bg-primary-light/30 transition-all hover:scale-110 ml-2"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-foreground/80 hover:text-primary transition-colors" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground/80 hover:text-primary transition-colors" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;