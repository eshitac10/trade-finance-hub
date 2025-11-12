import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, LogIn, ArrowRight, Users, BookOpen, Globe2, TrendingUp, Shield, Award, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Navbar from '@/components/Navbar';
import EventCarousel from '@/components/EventCarousel';
import AnimatedCounter from '@/components/AnimatedCounter';
import LatestArticles from '@/components/LatestArticles';
import tradeFinanceHero from '@/assets/trade-finance-hero.png';
import tradeNetworking from '@/assets/trade-networking.png';
import tradePatternBg from '@/assets/trade-pattern-bg.png';
import tfwLogo from "@/assets/tfw-logo-updated.png";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Restrict to admin credentials only
      if (email !== "admin@tfworld.com" || password !== "admin123") {
        throw new Error("Invalid credentials");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast({
          title: "Success!",
          description: "You've been logged in successfully.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLoginClick={() => setShowLoginDialog(true)} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1A0505] via-[#250707] to-[#1A0505] py-28 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={tradePatternBg} alt="" className="w-full h-full object-cover" />
        </div>
        
        
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#C9A961]/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-52 h-52 bg-[#C9A961]/15 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-[#C9A961]/10 rounded-full blur-2xl animate-float"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="flex justify-center mb-8 animate-fade-up">
              <div className="relative">
                <div className="absolute inset-0 bg-[#C9A961]/20 rounded-full blur-3xl animate-pulse"></div>
                <img src={tfwLogo} alt="Trade Finance World Globe" className="relative h-32 w-32 md:h-40 md:w-40 object-contain animate-float" />
              </div>
            </div>
            <h1 className="professional-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 sm:mb-8 tracking-widest animate-fade-up drop-shadow-2xl px-4 font-bold">
              TRADE FINANCE WORLD
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed animate-fade-up drop-shadow-lg px-4 sm:px-6 text-justify" style={{ animationDelay: '0.15s' }}>
              Welcome to TradeFinanceWorld, a premier knowledge-sharing platform created with the objective of disseminating information, expertise, and insights in the field of trade finance. This represents a modest yet significant beginning of our knowledge-sharing initiative, and we look forward to fostering widespread participation across the business and academic communities through this distinguished platform.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-background via-[#1A0505]/10 to-background border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A0505] via-[#C9A961] to-[#1A0505]"></div>
          <img src={tradePatternBg} alt="" className="w-full h-full object-cover mix-blend-overlay" />
        </div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-[#1A0505]/10 to-[#C9A961]/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-[#C9A961]/10 to-[#1A0505]/10 rounded-full blur-3xl animate-float-delayed"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-10 text-center">
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-gradient-card backdrop-blur-sm border border-border/60 hover:bg-background/60 hover:shadow-premium hover:border-[#C9A961]/40 hover:-translate-y-4" style={{ animationDelay: '0.1s' }}>
              <div className="relative">
                <div className="inline-block p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-[#1A0505] to-[#C9A961] rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-elegant">
                  <AnimatedCounter 
                    end={200} 
                    suffix="+"
                    className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white drop-shadow-md"
                  />
                </div>
                <div className="h-1 sm:h-1.5 w-16 sm:w-24 bg-gradient-to-r from-[#1A0505] via-[#C9A961] to-[#1A0505] mx-auto mb-2 sm:mb-4 rounded-full group-hover:w-24 sm:group-hover:w-32 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-xs sm:text-sm lg:text-base">Global Members</div>
            </div>
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-gradient-card backdrop-blur-sm border border-border/60 hover:bg-background/60 hover:shadow-premium hover:border-[#C9A961]/40 hover:-translate-y-4" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="inline-block p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-[#C9A961] to-[#1A0505] rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-elegant">
                  <AnimatedCounter 
                    end={50} 
                    suffix="+"
                    className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white drop-shadow-md"
                  />
                </div>
                <div className="h-1 sm:h-1.5 w-16 sm:w-24 bg-gradient-to-r from-[#C9A961] via-[#1A0505] to-[#C9A961] mx-auto mb-2 sm:mb-4 rounded-full group-hover:w-24 sm:group-hover:w-32 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-xs sm:text-sm lg:text-base">Countries</div>
            </div>
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-gradient-card backdrop-blur-sm border border-border/60 hover:bg-background/60 hover:shadow-premium hover:border-[#C9A961]/40 hover:-translate-y-4" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                <div className="inline-block p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-[#1A0505] to-[#C9A961] rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-elegant">
                  <AnimatedCounter 
                    end={200} 
                    suffix="+"
                    className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white drop-shadow-md"
                  />
                </div>
                <div className="h-1 sm:h-1.5 w-16 sm:w-24 bg-gradient-to-r from-[#1A0505] via-[#C9A961] to-[#1A0505] mx-auto mb-2 sm:mb-4 rounded-full group-hover:w-24 sm:group-hover:w-32 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-xs sm:text-sm lg:text-base">Events</div>
            </div>
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-gradient-card backdrop-blur-sm border border-border/60 hover:bg-background/60 hover:shadow-premium hover:border-[#C9A961]/40 hover:-translate-y-4" style={{ animationDelay: '0.4s' }}>
              <div className="relative">
                <div className="inline-block p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-[#C9A961] to-[#1A0505] rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-elegant">
                  <AnimatedCounter 
                    end={25} 
                    suffix="+"
                    className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white drop-shadow-md"
                  />
                </div>
                <div className="h-1 sm:h-1.5 w-16 sm:w-24 bg-gradient-to-r from-[#C9A961] via-[#1A0505] to-[#C9A961] mx-auto mb-2 sm:mb-4 rounded-full group-hover:w-24 sm:group-hover:w-32 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-xs sm:text-sm lg:text-base">Years</div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Carousel */}
        <section className="py-24">
          <div className="text-center mb-16 space-y-4 animate-fade-up">
            <h2 className="professional-heading text-4xl md:text-5xl text-primary mb-5">
              Recent Events & Gatherings
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-justify">
              Bringing together industry leaders and professionals from across the globe
            </p>
          </div>
          <div className="animate-scale-in">
            <EventCarousel />
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-24">
          <div className="text-center mb-20 space-y-5 animate-fade-up">
            <h2 className="professional-heading text-4xl md:text-5xl text-primary mb-5">
              Why Join Trade Finance World
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-justify">
              Empowering professionals with the resources and connections needed to excel
            </p>
          </div>
          
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
            <div className="group p-10 bg-gradient-card rounded-3xl shadow-professional border border-border/60 hover:shadow-premium hover:border-primary/40 transition-all duration-700 hover:-translate-y-6 animate-fade-in relative overflow-hidden backdrop-blur-sm" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl group-hover:scale-150 group-hover:rotate-45 transition-all duration-1000"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary-hover to-accent rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-elegant">
                  <Users className="h-12 w-12 text-primary-foreground" />
                </div>
                <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full mb-6 group-hover:w-24 transition-all duration-500"></div>
                <h3 className="professional-heading text-2xl text-primary mb-5 group-hover:text-accent transition-colors duration-500">
                  Expert Network
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base mb-6 text-justify">
                  Connect with leading professionals in trade finance and banking. Build meaningful relationships that drive your career forward.
                </p>
              </div>
            </div>
            
            <div className="group p-10 bg-gradient-card rounded-3xl shadow-professional border border-border/60 hover:shadow-premium hover:border-primary/40 transition-all duration-700 hover:-translate-y-6 animate-fade-in relative overflow-hidden backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl group-hover:scale-150 group-hover:rotate-45 transition-all duration-1000"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-accent via-accent-hover to-primary rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-elegant">
                  <BookOpen className="h-12 w-12 text-accent-foreground" />
                </div>
                <div className="h-1 w-16 bg-gradient-to-r from-accent to-primary rounded-full mb-6 group-hover:w-24 transition-all duration-500"></div>
                <h3 className="professional-heading text-2xl text-primary mb-5 group-hover:text-accent transition-colors duration-500">
                  Educational Resources
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base mb-6 text-justify">
                  Access exclusive articles, webinars, and industry insights. Stay ahead with cutting-edge knowledge and best practices.
                </p>
              </div>
            </div>
            
            <div className="group p-10 bg-gradient-card rounded-3xl shadow-professional border border-border/60 hover:shadow-premium hover:border-primary/40 transition-all duration-700 hover:-translate-y-6 animate-fade-in relative overflow-hidden backdrop-blur-sm" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl group-hover:scale-150 group-hover:rotate-45 transition-all duration-1000"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary-hover to-accent rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-elegant">
                  <Globe2 className="h-12 w-12 text-primary-foreground" />
                </div>
                <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full mb-6 group-hover:w-24 transition-all duration-500"></div>
                <h3 className="professional-heading text-2xl text-primary mb-5 group-hover:text-accent transition-colors duration-500">
                  Global Events
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base mb-6 text-justify">
                  Participate in world-class conferences and networking events. Connect with industry leaders and expand your global presence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Benefits */}
        <section className="py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gradient-card border border-border/60 hover:shadow-premium hover:border-primary/40 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="professional-heading text-xl text-primary mb-4">Industry Insights</h3>
              <p className="text-muted-foreground text-justify">
                Stay informed with the latest trends, market analysis, and regulatory updates in trade finance.
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-card border border-border/60 hover:shadow-premium hover:border-primary/40 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Shield className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="professional-heading text-xl text-primary mb-4">Trusted Community</h3>
              <p className="text-muted-foreground text-justify">
                Join a vetted network of professionals committed to excellence and ethical practices in trade finance.
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-gradient-card border border-border/60 hover:shadow-premium hover:border-primary/40 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Award className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="professional-heading text-xl text-primary mb-4">Professional Development</h3>
              <p className="text-muted-foreground text-justify">
                Access certification programs, workshops, and continuing education opportunities to advance your career.
              </p>
            </div>
          </div>
        </section>

        {/* Latest Articles */}
        <section className="py-20">
          <LatestArticles />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-secondary/30 via-background to-secondary/30 border-t border-border/60 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="banking-text text-muted-foreground">
            © {new Date().getFullYear()} Trade Finance World. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Login Dialog */}
      {showLoginDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50" onClick={() => setShowLoginDialog(false)}>
          <Card className="w-full max-w-md p-8 bg-card/95 backdrop-blur-xl border-border/60 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-8">
              <h2 className="professional-heading text-3xl font-bold mb-2 bg-gradient-to-r from-[#2B0808] to-[#C9A961] bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="banking-text text-muted-foreground">
                Sign in to access your Trade Finance World account
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="banking-text text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-border/60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="banking-text text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-border/60"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#2B0808] to-[#C9A961] hover:shadow-lg hover:scale-105 transition-all duration-300 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

          </Card>
        </div>
      )}
    </div>
  );
};

export default Login;
