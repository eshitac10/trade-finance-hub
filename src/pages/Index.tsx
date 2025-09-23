import React from 'react';
import Navbar from '@/components/Navbar';
import EventCarousel from '@/components/EventCarousel';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Trade Finance World
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connecting global trade finance professionals through education, networking, and industry expertise
          </p>
        </div>

        {/* Event Carousel */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-primary mb-8">
            Recent Events & Gatherings
          </h2>
          <EventCarousel />
        </div>

        {/* Additional Content Sections */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-card rounded-lg shadow-professional border border-border">
            <h3 className="text-xl font-semibold text-primary mb-3">
              Expert Network
            </h3>
            <p className="text-muted-foreground">
              Connect with leading professionals in trade finance and banking
            </p>
          </div>
          
          <div className="text-center p-6 bg-card rounded-lg shadow-professional border border-border">
            <h3 className="text-xl font-semibold text-primary mb-3">
              Educational Resources
            </h3>
            <p className="text-muted-foreground">
              Access exclusive articles, webinars, and industry insights
            </p>
          </div>
          
          <div className="text-center p-6 bg-card rounded-lg shadow-professional border border-border">
            <h3 className="text-xl font-semibold text-primary mb-3">
              Global Events
            </h3>
            <p className="text-muted-foreground">
              Join conferences, seminars, and networking opportunities worldwide
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
