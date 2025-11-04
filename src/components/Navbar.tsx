import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Youtube, Mail, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import tfwLogo from '@/assets/tfv-logo.png';

interface NavbarProps {
  onLoginClick?: () => void;
}

const Navbar = ({ onLoginClick }: NavbarProps) => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmitDocument = () => {
    if (file) {
      // In a real implementation, this would send the file to an email service
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
      youtube: 'https://www.youtube.com/playlist?list=PL1Pevhekc6MWqRwA5XEfqkL3LP-LLJl9X',
      whatsapp: 'https://api.whatsapp.com/send?phone=919176827480&text=Hi%20there!',
      email: 'mailto:contact@tradefinanceworld.com'
    };
    const url = urls[platform as keyof typeof urls];
    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed) {
        window.location.assign(url);
      }
    } catch (err) {
      if (navigator.clipboard && url) {
        navigator.clipboard.writeText(url);
        toast({
          title: 'Link copied to clipboard',
          description: 'Your environment blocked the site. Paste the URL into a permitted browser or device.',
        });
      }
    }
  };

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border shadow-professional sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo removed */}
          <div className="flex items-center">
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* About Us Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary flex items-center space-x-1 font-medium">
                  <span>About Us</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-background border border-border shadow-elegant z-50">
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer focus:bg-secondary">
                  Team
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer focus:bg-secondary">
                  About TFW
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary flex items-center space-x-1 font-medium">
                  <span>Resources</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-background border border-border shadow-elegant z-50">
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer focus:bg-secondary">
                  Member Important Conversations
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-secondary cursor-pointer focus:bg-secondary"
                  onClick={() => window.open('https://drive.google.com/drive/folders/your-folder-id', '_blank')}
                >
                  Member Articles
                </DropdownMenuItem>
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem 
                      className="hover:bg-secondary cursor-pointer focus:bg-secondary"
                      onSelect={(e) => e.preventDefault()}
                    >
                      Submit a Document
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-background border border-border">
                    <DialogHeader>
                      <DialogTitle>Submit Document</DialogTitle>
                      <DialogDescription>
                        Upload a document to share with our team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="document">Select Document</Label>
                        <Input
                          id="document"
                          type="file"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.txt"
                          className="cursor-pointer"
                        />
                      </div>
                      {file && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {file.name}
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={handleSubmitDocument}
                      className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
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
                <Button variant="ghost" className="text-foreground hover:text-primary flex items-center space-x-1 font-medium">
                  <span>Upcoming Events</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border border-border shadow-elegant z-50">
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer focus:bg-secondary">
                  Upcoming TFW Webinars
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer focus:bg-secondary">
                  Upcoming TFW Events
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer focus:bg-secondary">
                  Other Events
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-3 ml-8">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary p-2 hover:scale-110 transition-transform"
                onClick={() => handleSocialClick('youtube')}
                aria-label="Open YouTube playlist"
              >
                <Youtube className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary p-2 hover:scale-110 transition-transform"
                onClick={() => handleSocialClick('whatsapp')}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.520-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary p-2 hover:scale-110 transition-transform"
                onClick={() => handleSocialClick('email')}
              >
                <Mail className="h-5 w-5" />
              </Button>
            </div>

            {/* Auth Button */}
            <div className="flex items-center ml-4 border-l border-border pl-4">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-destructive font-medium hover:scale-105 transition-all"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-primary font-medium hover:scale-105 transition-all"
                  onClick={onLoginClick || (() => navigate('/'))}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
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