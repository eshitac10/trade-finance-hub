import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EventCarousel from '@/components/EventCarousel';
import AnimatedCounter from '@/components/AnimatedCounter';
import LatestArticles from '@/components/LatestArticles';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Users, BookOpen, Globe2, TrendingUp, Shield, Award, ChevronDown } from 'lucide-react';
import tradeFinanceHero from '@/assets/trade-finance-hero.png';
import tradeNetworking from '@/assets/trade-networking.png';
import tradePatternBg from '@/assets/trade-pattern-bg.png';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
          <div className="text-center space-y-6 sm:space-y-8">
            <h1 className="professional-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary-foreground mb-6 sm:mb-8 tracking-tight animate-fade-up drop-shadow-2xl px-4" style={{ animationDelay: '0.1s' }}>
              Trade Finance World
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-primary-foreground/95 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed animate-fade-up drop-shadow-lg px-4 sm:px-6" style={{ animationDelay: '0.2s' }}>
              Welcome to TradeFinanceWorld, a premier knowledge-sharing platform created with the objective of disseminating information, expertise, and insights in the field of trade finance. This represents a modest yet significant beginning of our knowledge-sharing initiative, and we look forward to fostering widespread participation across the business and academic communities through this distinguished platform.
            </p>
            {!isAuthenticated && (
              <div className="flex justify-center animate-fade-up px-4" style={{ animationDelay: '0.3s' }}>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="bg-accent text-accent-foreground hover:bg-accent-hover font-semibold px-8 sm:px-14 py-5 sm:py-7 text-base sm:text-lg rounded-xl shadow-premium hover:shadow-glow transition-all duration-500 hover:-translate-y-2 hover:scale-105 group relative overflow-hidden w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Get Started
                    <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-hover via-accent to-accent-hover bg-size-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section with Enhanced Design */}
      <section className="py-20 bg-gradient-to-br from-background via-secondary/30 to-background dark:from-background dark:via-secondary/20 dark:to-background border-y border-border relative overflow-hidden">
        {/* Enhanced Decorative Background */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary"></div>
          <img src={tradePatternBg} alt="" className="w-full h-full object-cover mix-blend-overlay" />
        </div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 rounded-full blur-3xl animate-float-delayed"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-10 text-center">
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-gradient-card backdrop-blur-sm border border-border/60 hover:bg-background/60 hover:shadow-premium hover:border-primary/40 hover:-translate-y-4" style={{ animationDelay: '0.1s' }}>
              <div className="relative">
                <div className="inline-block p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-primary to-accent rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-elegant">
                  <AnimatedCounter 
                    end={200} 
                    suffix="+"
                    className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary-foreground drop-shadow-md"
                  />
                </div>
                <div className="h-1 sm:h-1.5 w-16 sm:w-24 bg-gradient-to-r from-primary via-accent to-primary mx-auto mb-2 sm:mb-4 rounded-full group-hover:w-24 sm:group-hover:w-32 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-xs sm:text-sm lg:text-base">Global Members</div>
            </div>
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-gradient-card backdrop-blur-sm border border-border/60 hover:bg-background/60 hover:shadow-premium hover:border-primary/40 hover:-translate-y-4" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="inline-block p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-accent to-primary rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-elegant">
                  <AnimatedCounter 
                    end={50} 
                    suffix="+"
                    className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-accent-foreground drop-shadow-md"
                  />
                </div>
                <div className="h-1 sm:h-1.5 w-16 sm:w-24 bg-gradient-to-r from-accent via-primary to-accent mx-auto mb-2 sm:mb-4 rounded-full group-hover:w-24 sm:group-hover:w-32 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-xs sm:text-sm lg:text-base">Countries</div>
            </div>
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-gradient-card backdrop-blur-sm border border-border/60 hover:bg-background/60 hover:shadow-premium hover:border-primary/40 hover:-translate-y-4" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                <div className="inline-block p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-primary to-accent rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-elegant">
                  <AnimatedCounter 
                    end={200} 
                    suffix="+"
                    className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary-foreground drop-shadow-md"
                  />
                </div>
                <div className="h-1 sm:h-1.5 w-16 sm:w-24 bg-gradient-to-r from-primary via-accent to-primary mx-auto mb-2 sm:mb-4 rounded-full group-hover:w-24 sm:group-hover:w-32 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-xs sm:text-sm lg:text-base">Events</div>
            </div>
            <div className="group animate-slide-up transition-all duration-500 cursor-default p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-gradient-card backdrop-blur-sm border border-border/60 hover:bg-background/60 hover:shadow-premium hover:border-primary/40 hover:-translate-y-4" style={{ animationDelay: '0.4s' }}>
              <div className="relative">
                <div className="inline-block p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-accent to-primary rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-elegant">
                  <AnimatedCounter 
                    end={25} 
                    suffix="+"
                    className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-accent-foreground drop-shadow-md"
                  />
                </div>
                <div className="h-1 sm:h-1.5 w-16 sm:w-24 bg-gradient-to-r from-accent via-primary to-accent mx-auto mb-2 sm:mb-4 rounded-full group-hover:w-24 sm:group-hover:w-32 transition-all duration-500 shadow-glow"></div>
              </div>
              <div className="text-muted-foreground font-semibold text-xs sm:text-sm lg:text-base">Years</div>
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
            <div className="group p-10 bg-gradient-card rounded-3xl shadow-professional border border-border/60 hover:shadow-premium hover:border-primary/40 transition-all duration-700 hover:-translate-y-6 animate-fade-in relative overflow-hidden backdrop-blur-sm" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl group-hover:scale-150 group-hover:rotate-45 transition-all duration-1000"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary-hover to-accent rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-elegant group-hover:shadow-accent">
                  <Users className="h-12 w-12 text-primary-foreground" />
                </div>
                <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full mb-6 group-hover:w-24 transition-all duration-500"></div>
                <h3 className="professional-heading text-2xl text-primary mb-5 group-hover:text-accent transition-colors duration-500">
                  Expert Network
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base mb-6">
                  Connect with leading professionals in trade finance and banking. Build meaningful relationships that drive your career forward.
                </p>
                <div className="flex items-center text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-sm font-semibold">Explore Network</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
            
            <div className="group p-10 bg-gradient-card rounded-3xl shadow-professional border border-border/60 hover:shadow-premium hover:border-primary/40 transition-all duration-700 hover:-translate-y-6 animate-fade-in relative overflow-hidden backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl group-hover:scale-150 group-hover:rotate-45 transition-all duration-1000"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-accent via-accent-hover to-primary rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-elegant group-hover:shadow-accent">
                  <BookOpen className="h-12 w-12 text-accent-foreground" />
                </div>
                <div className="h-1 w-16 bg-gradient-to-r from-accent to-primary rounded-full mb-6 group-hover:w-24 transition-all duration-500"></div>
                <h3 className="professional-heading text-2xl text-primary mb-5 group-hover:text-accent transition-colors duration-500">
                  Educational Resources
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base mb-6">
                  Access exclusive articles, webinars, and industry insights. Stay ahead with cutting-edge knowledge and best practices.
                </p>
                <div className="flex items-center text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-sm font-semibold">View Resources</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
            
            <div className="group p-10 bg-gradient-card rounded-3xl shadow-professional border border-border/60 hover:shadow-premium hover:border-primary/40 transition-all duration-700 hover:-translate-y-6 animate-fade-in relative overflow-hidden backdrop-blur-sm" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl group-hover:scale-150 group-hover:rotate-45 transition-all duration-1000"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary-hover to-accent rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-elegant group-hover:shadow-accent">
                  <Globe2 className="h-12 w-12 text-primary-foreground" />
                </div>
                <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full mb-6 group-hover:w-24 transition-all duration-500"></div>
                <h3 className="professional-heading text-2xl text-primary mb-5 group-hover:text-accent transition-colors duration-500">
                  Global Events
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base mb-6">
                  Join conferences, seminars, and networking opportunities worldwide. Engage with thought leaders and shape the future of trade finance.
                </p>
                <div className="flex items-center text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-sm font-semibold">Discover Events</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Benefits with Premium Card Design */}
        <section className="py-24 bg-gradient-to-br from-secondary/60 via-secondary/40 to-secondary/60 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl relative overflow-hidden">
          {/* Enhanced Background Graphics */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary to-accent rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-accent to-primary rounded-full blur-3xl animate-float-delayed"></div>
          </div>
          <div className="absolute inset-0 opacity-5">
            <img src={tradePatternBg} alt="" className="w-full h-full object-cover" />
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid md:grid-cols-3 gap-10">
              <div className="flex items-start space-x-5 p-8 rounded-2xl bg-background/60 backdrop-blur-md border border-border/60 hover:border-primary/50 hover:shadow-elegant transition-all duration-500 hover:-translate-y-3 hover:bg-background/80 group">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-professional group-hover:shadow-accent">
                  <TrendingUp className="h-10 w-10 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="professional-heading text-xl text-primary mb-3 group-hover:text-accent transition-colors">Industry Insights</h4>
                  <p className="text-muted-foreground text-base leading-relaxed">Access real-time market analysis and expert commentary on emerging trends</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-5 p-8 rounded-2xl bg-background/60 backdrop-blur-md border border-border/60 hover:border-primary/50 hover:shadow-elegant transition-all duration-500 hover:-translate-y-3 hover:bg-background/80 group">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-professional group-hover:shadow-accent">
                  <Shield className="h-10 w-10 text-accent-foreground" />
                </div>
                <div>
                  <h4 className="professional-heading text-xl text-primary mb-3 group-hover:text-accent transition-colors">Trusted Community</h4>
                  <p className="text-muted-foreground text-base leading-relaxed">Join a vetted network of verified professionals and institutions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-5 p-8 rounded-2xl bg-background/60 backdrop-blur-md border border-border/60 hover:border-primary/50 hover:shadow-elegant transition-all duration-500 hover:-translate-y-3 hover:bg-background/80 group">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-professional group-hover:shadow-accent">
                  <Award className="h-10 w-10 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="professional-heading text-xl text-primary mb-3 group-hover:text-accent transition-colors">Professional Development</h4>
                  <p className="text-muted-foreground text-base leading-relaxed">Elevate your expertise with certifications and specialized training programs</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Articles Section */}
        <LatestArticles />

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
