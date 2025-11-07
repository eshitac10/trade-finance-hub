import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Youtube, LogIn, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import tfwLogo from "@/assets/tfv-logo.png";

interface NavbarProps {
  onLoginClick?: () => void;
}

const Navbar = ({ onLoginClick }: NavbarProps) => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmitDocument = () => {
    if (file) {
      toast({
        title: "Document Submitted",
        description: `${file.name} has been sent to our team for review.`,
      });
      setFile(null);
    } else {
      toast({
        title: "No File Selected",
        description: "Please select a document to submit.",
        variant: "destructive",
      });
    }
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem
                          className="banking-text hover:bg-primary-light/30 cursor-pointer focus:bg-primary-light/30 rounded-lg px-3 py-2.5 transition-all"
                          onSelect={(e) => e.preventDefault()}
                        >
                          Submit a Document
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-card/98 backdrop-blur-xl border border-border/60 shadow-premium rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="professional-heading text-2xl">Submit Document</DialogTitle>
                          <DialogDescription className="banking-text">Upload a document to share with our team.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="document" className="banking-text font-medium">Select Document</Label>
                            <Input
                              id="document"
                              type="file"
                              onChange={handleFileUpload}
                              accept=".pdf,.doc,.docx,.txt"
                              className="cursor-pointer banking-text border-border/60 rounded-xl"
                            />
                          </div>
                          {file && <p className="text-sm text-muted-foreground banking-text">Selected: {file.name}</p>}
                        </div>
                        <Button
                          onClick={handleSubmitDocument}
                          className="w-full bg-gradient-primary hover:shadow-elegant text-primary-foreground font-semibold py-6 rounded-xl transition-all hover:scale-[1.02]"
                        >
                          Submit Document
                        </Button>
                      </DialogContent>
                    </Dialog>
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
                    <DropdownMenuItem className="banking-text hover:bg-primary-light/30 cursor-pointer focus:bg-primary-light/30 rounded-lg px-3 py-2.5 transition-all">
                      Upcoming TFW Webinars
                    </DropdownMenuItem>
                    <DropdownMenuItem className="banking-text hover:bg-primary-light/30 cursor-pointer focus:bg-primary-light/30 rounded-lg px-3 py-2.5 transition-all">
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
                onClick={onLoginClick || (() => navigate("/"))}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button
                size="sm"
                className="banking-text bg-gradient-primary hover:shadow-accent text-primary-foreground font-semibold px-8 py-5 rounded-xl transition-all hover:scale-105"
                onClick={() => navigate("/signup")}
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