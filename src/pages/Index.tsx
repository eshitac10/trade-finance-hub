import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EventCarousel from '@/components/EventCarousel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Users, BookOpen, Globe2, TrendingUp, Shield, Award, ChevronDown, Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dummy credentials check
    if (email === 'admin@tfworld.com' && password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      
      toast({
        title: "Login Successful",
        description: "Welcome to Trade Finance World",
      });
      
      setShowLoginDialog(false);
      navigate('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Try admin@tfworld.com / admin123",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLoginClick={() => setShowLoginDialog(true)} />
      
      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-primary/20">
          <DialogHeader>
            <DialogTitle className="professional-heading text-2xl text-primary text-center">
              Login to Trade Finance World
            </DialogTitle>
          </DialogHeader>

          {/* Demo Credentials */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-accent mb-2">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">Email: admin@tfworld.com</p>
            <p className="text-xs text-muted-foreground">Password: admin123</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@tfworld.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50 border-border focus:border-accent transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-background/50 border-border focus:border-accent transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-elegant hover:shadow-2xl transition-all hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                  Logging in...
                </div>
              ) : (
                <>
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Hero Section with Gradient */}
      <section className="relative bg-gradient-hero py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20 animate-float"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary-foreground/10 rounded-full blur-3xl animate-float-delayed"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="professional-heading text-5xl md:text-6xl lg:text-7xl text-primary-foreground mb-6 tracking-tight animate-fade-in">
              Trade Finance World
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/95 max-w-4xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Welcome to TradeFinanceWorld, a premier knowledge-sharing platform created with the objective of disseminating information, expertise, and insights in the field of trade finance. This represents a modest yet significant beginning of our knowledge-sharing initiative, and we look forward to fostering widespread participation across the business and academic communities through this distinguished platform.
            </p>
            <div className="flex justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button 
                size="lg" 
                onClick={() => setShowLoginDialog(true)}
                className="bg-accent text-accent-foreground hover:bg-accent-hover font-semibold px-12 py-6 text-lg shadow-elegant hover:shadow-2xl transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Login to Continue
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-hover to-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </div>

            {/* Removed scroll indicator */}
          </div>
        </div>
      </section>

      {/* Stats Section with Counters */}
      <section className="py-16 bg-secondary border-y border-border relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary via-transparent to-accent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group animate-slide-up hover:scale-110 transition-all duration-500 cursor-default" style={{ animationDelay: '0.1s' }}>
              <div className="relative">
                <div className="text-5xl font-display font-bold text-primary mb-2 group-hover:scale-125 transition-transform duration-500">10,000+</div>
                <div className="h-1 w-16 bg-gradient-primary mx-auto mb-3 group-hover:w-24 transition-all duration-500"></div>
              </div>
              <div className="text-muted-foreground font-medium">Global Members</div>
            </div>
            <div className="group animate-slide-up hover:scale-110 transition-all duration-500 cursor-default" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="text-5xl font-display font-bold text-primary mb-2 group-hover:scale-125 transition-transform duration-500">50+</div>
                <div className="h-1 w-16 bg-gradient-primary mx-auto mb-3 group-hover:w-24 transition-all duration-500"></div>
              </div>
              <div className="text-muted-foreground font-medium">Countries Represented</div>
            </div>
            <div className="group animate-slide-up hover:scale-110 transition-all duration-500 cursor-default" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                <div className="text-5xl font-display font-bold text-primary mb-2 group-hover:scale-125 transition-transform duration-500">200+</div>
                <div className="h-1 w-16 bg-gradient-primary mx-auto mb-3 group-hover:w-24 transition-all duration-500"></div>
              </div>
              <div className="text-muted-foreground font-medium">Annual Events</div>
            </div>
            <div className="group animate-slide-up hover:scale-110 transition-all duration-500 cursor-default" style={{ animationDelay: '0.4s' }}>
              <div className="relative">
                <div className="text-5xl font-display font-bold text-primary mb-2 group-hover:scale-125 transition-transform duration-500">25+</div>
                <div className="h-1 w-16 bg-gradient-primary mx-auto mb-3 group-hover:w-24 transition-all duration-500"></div>
              </div>
              <div className="text-muted-foreground font-medium">Years of Excellence</div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Carousel Section */}
        <section className="py-20">
          <div className="text-center mb-12">
            <h2 className="professional-heading text-4xl md:text-5xl text-primary mb-4">
              Recent Events & Gatherings
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bringing together industry leaders and professionals from across the globe
            </p>
          </div>
          <EventCarousel />
        </section>

        {/* Value Propositions */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="professional-heading text-4xl md:text-5xl text-primary mb-4">
              Why Join Trade Finance World
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empowering professionals with the resources and connections needed to excel
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-card rounded-xl shadow-professional border border-border hover:shadow-2xl hover:border-accent/50 transition-all duration-500 hover:-translate-y-3 animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-professional">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              <h3 className="professional-heading text-2xl text-primary mb-4 group-hover:text-accent transition-colors duration-300">
                Expert Network
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with leading professionals in trade finance and banking. Build meaningful relationships that drive your career forward.
              </p>
              </div>
            </div>
            
            <div className="group p-8 bg-card rounded-xl shadow-professional border border-border hover:shadow-2xl hover:border-accent/50 transition-all duration-500 hover:-translate-y-3 animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-professional">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              <h3 className="professional-heading text-2xl text-primary mb-4 group-hover:text-accent transition-colors duration-300">
                Educational Resources
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Access exclusive articles, webinars, and industry insights. Stay ahead with cutting-edge knowledge and best practices.
              </p>
              </div>
            </div>
            
            <div className="group p-8 bg-card rounded-xl shadow-professional border border-border hover:shadow-2xl hover:border-accent/50 transition-all duration-500 hover:-translate-y-3 animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-professional">
                  <Globe2 className="h-8 w-8 text-primary" />
                </div>
              <h3 className="professional-heading text-2xl text-primary mb-4 group-hover:text-accent transition-colors duration-300">
                Global Events
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Join conferences, seminars, and networking opportunities worldwide. Engage with thought leaders and shape the future of trade finance.
              </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Benefits */}
        <section className="py-20 bg-secondary/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-2xl">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-lg text-primary mb-2">Industry Insights</h4>
                  <p className="text-muted-foreground text-sm">Access real-time market analysis and expert commentary on emerging trends</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-lg text-primary mb-2">Trusted Community</h4>
                  <p className="text-muted-foreground text-sm">Join a vetted network of verified professionals and institutions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-lg text-primary mb-2">Professional Development</h4>
                  <p className="text-muted-foreground text-sm">Elevate your expertise with certifications and specialized training programs</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Simplified Footer */}
      <footer className="bg-primary text-primary-foreground py-6 border-t border-primary-hover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-primary-foreground/70">
            <p>&copy; 2024 Trade Finance World. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
