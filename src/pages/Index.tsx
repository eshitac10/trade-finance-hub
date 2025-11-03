import React from 'react';
import Navbar from '@/components/Navbar';
import EventCarousel from '@/components/EventCarousel';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, BookOpen, Globe2, TrendingUp, Shield, Award } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WhatsAppFloat />
      
      {/* Hero Section with Gradient */}
      <section className="relative bg-gradient-hero py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="professional-heading text-5xl md:text-6xl lg:text-7xl text-primary-foreground mb-6 tracking-tight">
              Trade Finance World
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto mb-10 leading-relaxed">
              The premier global community connecting trade finance professionals through education, networking, and industry excellence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent-hover font-semibold px-8 shadow-elegant">
                Join Our Community <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 shadow-elegant">
                Upcoming Events
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Global Members</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Countries Represented</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Annual Events</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">25+</div>
              <div className="text-muted-foreground">Years of Excellence</div>
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
            <div className="group p-8 bg-card rounded-lg shadow-professional border border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="professional-heading text-2xl text-primary mb-4">
                Expert Network
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with leading professionals in trade finance and banking. Build meaningful relationships that drive your career forward.
              </p>
            </div>
            
            <div className="group p-8 bg-card rounded-lg shadow-professional border border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3 className="professional-heading text-2xl text-primary mb-4">
                Educational Resources
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Access exclusive articles, webinars, and industry insights. Stay ahead with cutting-edge knowledge and best practices.
              </p>
            </div>
            
            <div className="group p-8 bg-card rounded-lg shadow-professional border border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Globe2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="professional-heading text-2xl text-primary mb-4">
                Global Events
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Join conferences, seminars, and networking opportunities worldwide. Engage with thought leaders and shape the future of trade finance.
              </p>
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

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="professional-heading text-4xl md:text-5xl text-primary mb-6">
              Ready to Elevate Your Career?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join thousands of professionals who are shaping the future of global trade finance
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold px-10 shadow-elegant">
              Become a Member Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 border-t border-primary-hover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="font-display font-semibold text-lg mb-4">About</h5>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-accent transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-display font-semibold text-lg mb-4">Resources</h5>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-accent transition-colors">Articles</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Webinars</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Research</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-display font-semibold text-lg mb-4">Events</h5>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-accent transition-colors">Upcoming Events</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Past Events</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Sponsorship</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-display font-semibold text-lg mb-4">Connect</h5>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-accent transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/70">
            <p>&copy; 2024 Trade Finance World. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
