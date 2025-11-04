import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EventCarousel from '@/components/EventCarousel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Users, BookOpen, Globe2, TrendingUp, Shield, Award, ChevronDown, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import tradeFinanceHero from '@/assets/trade-finance-hero.png';
import tradeNetworking from '@/assets/trade-networking.png';
import tradePatternBg from '@/assets/trade-pattern-bg.png';

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
      
      {/* Hero Section with Enhanced Gradient and Graphics */}
      <section className="relative bg-gradient-hero py-28 lg:py-40 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <img src={tradePatternBg} alt="" className="w-full h-full object-cover" />
        </div>
        
        {/* Hero Image */}
        <div className="absolute inset-0 opacity-20">
          <img src={tradeFinanceHero} alt="" className="w-full h-full object-cover mix-blend-overlay" />
        </div>
        
        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-accent/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-52 h-52 bg-primary-foreground/15 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl animate-float"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="professional-heading text-5xl md:text-6xl lg:text-7xl text-primary-foreground mb-8 tracking-tight animate-fade-up drop-shadow-2xl">
              Trade Finance World
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/95 max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-up drop-shadow-lg" style={{ animationDelay: '0.15s' }}>
              Welcome to TradeFinanceWorld, a premier knowledge-sharing platform created with the objective of disseminating information, expertise, and insights in the field of trade finance. This represents a modest yet significant beginning of our knowledge-sharing initiative, and we look forward to fostering widespread participation across the business and academic communities through this distinguished platform.
            </p>
            <div className="flex justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                onClick={() => setShowLoginDialog(true)}
                className="bg-accent text-accent-foreground hover:bg-accent-hover font-semibold px-14 py-7 text-lg rounded-xl shadow-premium hover:shadow-glow transition-all duration-500 hover:-translate-y-2 hover:scale-105 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Login to Continue
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-hover via-accent to-accent-hover bg-size-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Enhanced Design */}
      <section className="py-20 bg-gradient-to-br from-secondary via-secondary/80 to-secondary border-y border-border relative overflow-hidden">
        {/* Enhanced Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary via-transparent to-accent"></div>
        </div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-10 text-center">
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-6 rounded-2xl hover:bg-background/40 hover:shadow-elegant backdrop-blur-sm" style={{ animationDelay: '0.1s' }}>
              <div className="relative">
                <div className="text-6xl font-display font-bold text-primary mb-3 group-hover:scale-110 transition-transform duration-500 drop-shadow-md">200+</div>
                <div className="h-1.5 w-20 bg-gradient-primary mx-auto mb-4 rounded-full group-hover:w-28 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-base">Global Members</div>
            </div>
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-6 rounded-2xl hover:bg-background/40 hover:shadow-elegant backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="text-6xl font-display font-bold text-primary mb-3 group-hover:scale-110 transition-transform duration-500 drop-shadow-md">50+</div>
                <div className="h-1.5 w-20 bg-gradient-primary mx-auto mb-4 rounded-full group-hover:w-28 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-base">Countries Represented</div>
            </div>
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-6 rounded-2xl hover:bg-background/40 hover:shadow-elegant backdrop-blur-sm" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                <div className="text-6xl font-display font-bold text-primary mb-3 group-hover:scale-110 transition-transform duration-500 drop-shadow-md">200+</div>
                <div className="h-1.5 w-20 bg-gradient-primary mx-auto mb-4 rounded-full group-hover:w-28 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-base">Annual Events</div>
            </div>
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-6 rounded-2xl hover:bg-background/40 hover:shadow-elegant backdrop-blur-sm" style={{ animationDelay: '0.4s' }}>
              <div className="relative">
                <div className="text-6xl font-display font-bold text-primary mb-3 group-hover:scale-110 transition-transform duration-500 drop-shadow-md">25+</div>
                <div className="h-1.5 w-20 bg-gradient-primary mx-auto mb-4 rounded-full group-hover:w-28 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-base">Years of Excellence</div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Carousel Section with Enhanced Spacing */}
        <section className="py-24">
          <div className="text-center mb-16 space-y-4 animate-fade-up">
            <h2 className="professional-heading text-4xl md:text-5xl text-primary mb-5">
              Recent Events & Gatherings
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Bringing together industry leaders and professionals from across the globe
            </p>
          </div>
          <div className="animate-scale-in">
            <EventCarousel />
          </div>
        </section>

        {/* Value Propositions with Premium Design */}
        <section className="py-24">
          <div className="text-center mb-20 space-y-5 animate-fade-up">
            <h2 className="professional-heading text-4xl md:text-5xl text-primary mb-5">
              Why Join Trade Finance World
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Empowering professionals with the resources and connections needed to excel
            </p>
          </div>
          
          {/* Featured Networking Image */}
          <div className="mb-16 animate-fade-in">
            <div className="relative rounded-3xl overflow-hidden shadow-premium border border-border hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 group">
              <img 
                src={tradeNetworking} 
                alt="Global Trade Finance Networking" 
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700"></div>
              <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
                <h3 className="text-3xl font-bold mb-3">Connect with Global Trade Finance Leaders</h3>
                <p className="text-lg opacity-95">Building partnerships that drive international trade forward</p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="group p-10 bg-card rounded-2xl shadow-elegant border border-border hover:shadow-premium hover:border-accent/60 transition-all duration-700 hover:-translate-y-4 animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-accent/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-elegant">
                  <Users className="h-10 w-10 text-primary" />
                </div>
              <h3 className="professional-heading text-2xl text-primary mb-5 group-hover:text-accent transition-colors duration-500">
                Expert Network
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                Connect with leading professionals in trade finance and banking. Build meaningful relationships that drive your career forward.
              </p>
              </div>
            </div>
            
            <div className="group p-10 bg-card rounded-2xl shadow-elegant border border-border hover:shadow-premium hover:border-accent/60 transition-all duration-700 hover:-translate-y-4 animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-accent/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-elegant">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
              <h3 className="professional-heading text-2xl text-primary mb-5 group-hover:text-accent transition-colors duration-500">
                Educational Resources
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                Access exclusive articles, webinars, and industry insights. Stay ahead with cutting-edge knowledge and best practices.
              </p>
              </div>
            </div>
            
            <div className="group p-10 bg-card rounded-2xl shadow-elegant border border-border hover:shadow-premium hover:border-accent/60 transition-all duration-700 hover:-translate-y-4 animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-accent/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-elegant">
                  <Globe2 className="h-10 w-10 text-primary" />
                </div>
              <h3 className="professional-heading text-2xl text-primary mb-5 group-hover:text-accent transition-colors duration-500">
                Global Events
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                Join conferences, seminars, and networking opportunities worldwide. Engage with thought leaders and shape the future of trade finance.
              </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Benefits with Premium Card Design */}
        <section className="py-24 bg-gradient-to-br from-secondary/60 via-secondary/40 to-secondary/60 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid md:grid-cols-3 gap-10">
              <div className="flex items-start space-x-5 p-8 rounded-2xl bg-background/40 backdrop-blur-sm border border-border/50 hover:border-accent/50 hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-professional">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h4 className="professional-heading text-xl text-primary mb-3 group-hover:text-accent transition-colors">Industry Insights</h4>
                  <p className="text-muted-foreground text-base leading-relaxed">Access real-time market analysis and expert commentary on emerging trends</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-5 p-8 rounded-2xl bg-background/40 backdrop-blur-sm border border-border/50 hover:border-accent/50 hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-professional">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h4 className="professional-heading text-xl text-primary mb-3 group-hover:text-accent transition-colors">Trusted Community</h4>
                  <p className="text-muted-foreground text-base leading-relaxed">Join a vetted network of verified professionals and institutions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-5 p-8 rounded-2xl bg-background/40 backdrop-blur-sm border border-border/50 hover:border-accent/50 hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-professional">
                  <Award className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h4 className="professional-heading text-xl text-primary mb-3 group-hover:text-accent transition-colors">Professional Development</h4>
                  <p className="text-muted-foreground text-base leading-relaxed">Elevate your expertise with certifications and specialized training programs</p>
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
