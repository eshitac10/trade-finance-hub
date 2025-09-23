import React, { useState } from 'react';
import { ChevronDown, Youtube, Mail, MessageCircle } from 'lucide-react';
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

const Navbar = () => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

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
      youtube: 'https://youtube.com/@tradefinanceworld',
      whatsapp: 'https://wa.me/1234567890',
      email: 'mailto:contact@tradefinanceworld.com'
    };
    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  return (
    <nav className="bg-background border-b border-border shadow-professional sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={tfwLogo} 
              alt="Trade Finance World" 
              className="h-12 w-auto"
            />
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* About Us Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary flex items-center space-x-1">
                  <span>About Us</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-background border border-border shadow-elegant">
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer">
                  Team
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer">
                  About TFW
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary flex items-center space-x-1">
                  <span>Resources</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-background border border-border shadow-elegant">
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer">
                  Member Important Conversations
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-secondary cursor-pointer"
                  onClick={() => window.open('https://drive.google.com/drive/folders/your-folder-id', '_blank')}
                >
                  Member Articles
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer">
                  Events
                </DropdownMenuItem>
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem 
                      className="hover:bg-secondary cursor-pointer"
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
                <DropdownMenuItem 
                  className="hover:bg-secondary cursor-pointer"
                  onClick={() => window.open('https://youtube.com/@tradefinanceworld', '_blank')}
                >
                  TFW Webinars
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Upcoming Events Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary flex items-center space-x-1">
                  <span>Upcoming Events</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border border-border shadow-elegant">
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer">
                  Upcoming TFW Webinars
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer">
                  Upcoming TFW Events
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-secondary cursor-pointer">
                  Other Events
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-3 ml-8">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary p-2"
                onClick={() => handleSocialClick('youtube')}
              >
                <Youtube className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary p-2"
                onClick={() => handleSocialClick('whatsapp')}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary p-2"
                onClick={() => handleSocialClick('email')}
              >
                <Mail className="h-5 w-5" />
              </Button>
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