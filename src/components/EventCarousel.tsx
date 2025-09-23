import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import financeEvent1 from '@/assets/finance-event-1.jpg';
import financeEvent2 from '@/assets/finance-event-2.jpg';
import financeEvent3 from '@/assets/finance-event-3.jpg';
import financeEvent4 from '@/assets/finance-event-4.jpg';

const EventCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: financeEvent1,
      title: "Trade Finance Summit 2024",
      description: "Leading professionals gathering to discuss the future of trade finance"
    },
    {
      image: financeEvent2,
      title: "Banking Innovation Forum",
      description: "Networking event connecting financial institutions worldwide"
    },
    {
      image: financeEvent3,
      title: "TFW Educational Seminar",
      description: "Expert-led session on emerging trends in international trade"
    },
    {
      image: financeEvent4,
      title: "Global Banking Conference",
      description: "International summit bringing together industry leaders"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-96 lg:h-[500px] overflow-hidden bg-muted rounded-lg shadow-elegant">
      {/* Images */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-end">
              <div className="p-8 text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  {slide.title}
                </h3>
                <p className="text-lg text-gray-200">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;