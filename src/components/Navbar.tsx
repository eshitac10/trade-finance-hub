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
                  <DropdownMenuContent className="bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-xl border-accent/30 shadow-premium z-50 min-w-[240px] p-2">
                    <DropdownMenuItem 
                      onClick={() => navigate("/articles")}
                      className="banking-text cursor-pointer rounded-lg px-4 py-3 hover:bg-primary/10 hover:text-accent transition-all duration-300 focus:bg-primary/10 focus:text-accent"
                    >
                      Articles
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate("/chat-import")}
                      className="banking-text cursor-pointer rounded-lg px-4 py-3 hover:bg-primary/10 hover:text-accent transition-all duration-300 focus:bg-primary/10 focus:text-accent"
                    >
                      Member Important Conversations
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate("/memories")}
                      className="banking-text cursor-pointer rounded-lg px-4 py-3 hover:bg-primary/10 hover:text-accent transition-all duration-300 focus:bg-primary/10 focus:text-accent"
                    >
                      Memories
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
                  <DropdownMenuContent className="bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-xl border-accent/30 shadow-premium z-50 min-w-[240px] p-2">
                    <DropdownMenuItem 
                      onClick={() => navigate("/webinars")}
                      className="banking-text cursor-pointer rounded-lg px-4 py-3 hover:bg-primary/10 hover:text-accent transition-all duration-300 focus:bg-primary/10 focus:text-accent"
                    >
                      TFW Past Webinars
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate("/events")}
                      className="banking-text cursor-pointer rounded-lg px-4 py-3 hover:bg-primary/10 hover:text-accent transition-all duration-300 focus:bg-primary/10 focus:text-accent"
                    >
                      Upcoming Webinars/Events
                    </DropdownMenuItem>
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
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#C9A961' }}>
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
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
                          onClick={() => navigate("/chat-import")}
                          className="justify-start w-full banking-text text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 pl-6"
                        >
                          Member Important Conversations
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/memories")}
                          className="justify-start w-full banking-text text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 pl-6"
                        >
                          Memories
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[#C9A961] text-xs px-3 font-bold">Events</p>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/webinars")}
                          className="justify-start w-full banking-text text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 pl-6"
                        >
                          TFW Past Webinars
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/events")}
                          className="justify-start w-full banking-text text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20 pl-6"
                        >
                          Upcoming Webinars/Events
                        </Button>
                      </div>
                      <div className="border-t border-[#C9A961]/20 pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => handleSocialClick("https://www.youtube.com/@TradefinanceWorld")}
                          className="justify-start w-full banking-text font-bold text-[#C9A961] hover:text-white hover:bg-[#C9A961]/20"
                        >
                          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
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
