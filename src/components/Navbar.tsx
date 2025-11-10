import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Sun, Moon, Menu, ChevronDown } from "lucide-react";
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
import tfwLogo from "@/assets/tfw-full-logo.png";
import youtubeIcon from "@/assets/youtube-icon.png";

interface NavbarProps {
  onLoginClick?: () => void;
}

const Navbar = ({ onLoginClick }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const handleSocialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#1A0505]/95 border-b border-[#C9A961]/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <img src={tfwLogo} alt="TFW Logo" className="h-20 w-auto" />
          </div>

          {isAuthenticated ? (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center justify-center flex-1 space-x-1">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="banking-text font-bold text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 transition-colors"
                >
                  Home
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="banking-text font-bold text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 transition-colors"
                    >
                      Resources
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background/95 backdrop-blur-xl border-border z-50">
                    <DropdownMenuItem onClick={() => navigate("/articles")}>Articles</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/submit-document")}>Submit Document</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/chat-import")}>
                      Member Important Conversations
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="banking-text font-bold text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 transition-colors"
                    >
                      Events
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background/95 backdrop-blur-xl border-border z-50">
                    <DropdownMenuItem onClick={() => navigate("/webinars")}>Webinars</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/events")}>Upcoming Events</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSocialClick("https://www.youtube.com/@TradefinanceWorld")}
                  className="hover:bg-[#C9A961]/20 transition-colors"
                >
                  <img src={youtubeIcon} alt="YouTube" className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 transition-colors"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-[#C9A961] text-[#C9A961] hover:bg-[#C9A961]/20 banking-text font-bold"
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
                  className="text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 transition-colors"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-[#C9A961]">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-64 bg-[#1A0505]/95 backdrop-blur-xl border-[#C9A961]/20">
                    <div className="flex flex-col space-y-4 mt-8">
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/dashboard")}
                        className="justify-start banking-text font-bold text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20"
                      >
                        Home
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/articles")}
                        className="justify-start banking-text font-bold text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20"
                      >
                        Articles
                      </Button>
                      <div className="space-y-2">
                        <p className="text-[#C9A961] text-xs px-3 font-bold">Resources</p>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/articles")}
                          className="justify-start w-full banking-text text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 pl-6"
                        >
                          Articles
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/submit-document")}
                          className="justify-start w-full banking-text text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 pl-6"
                        >
                          Submit Document
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/chat-import")}
                          className="justify-start w-full banking-text text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 pl-6"
                        >
                          Member Important Conversations
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[#C9A961] text-xs px-3 font-bold">Events</p>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/webinars")}
                          className="justify-start w-full banking-text text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 pl-6"
                        >
                          Webinars
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/events")}
                          className="justify-start w-full banking-text text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 pl-6"
                        >
                          Upcoming Events
                        </Button>
                      </div>
                      <div className="border-t border-[#C9A961]/20 pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => handleSocialClick("https://www.youtube.com/@TradefinanceWorld")}
                          className="justify-start w-full banking-text font-bold text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20"
                        >
                          <img src={youtubeIcon} alt="YouTube" className="h-5 w-5 mr-2" />
                          YouTube
                        </Button>
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          className="w-full mt-4 border-[#C9A961] text-[#C9A961] hover:bg-[#C9A961]/20 banking-text font-bold"
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
              {/* Unauthenticated - Login/Signup centered with theme toggle on right */}
              <div className="hidden md:flex items-center justify-center flex-1 space-x-4">
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  className="border-[#C9A961] text-[#C9A961] hover:bg-[#C9A961]/20 banking-text font-bold"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-[#C9A961] to-[#1A0505] hover:shadow-lg text-white banking-text font-bold"
                >
                  Sign Up
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
                  className="text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 transition-colors"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-[#C9A961]">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-64 bg-[#1A0505]/95 backdrop-blur-xl border-[#C9A961]/20">
                    <div className="flex flex-col space-y-4 mt-8">
                      <Button
                        onClick={() => navigate("/auth")}
                        variant="outline"
                        className="border-[#C9A961] text-[#C9A961] hover:bg-[#C9A961]/20 banking-text font-bold w-full"
                      >
                        Login
                      </Button>
                      <Button
                        onClick={() => navigate("/signup")}
                        className="bg-gradient-to-r from-[#C9A961] to-[#1A0505] hover:shadow-lg text-white banking-text font-bold w-full"
                      >
                        Sign Up
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
