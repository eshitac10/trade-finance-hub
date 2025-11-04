import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import tfwAnniversary1 from '@/assets/tfw-anniversary-1.png';
import tfwAnniversary2 from '@/assets/tfw-anniversary-2.png';
import tfwAnniversaryVideo from '@/assets/tfw-anniversary-video.mp4';

const EventCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: tfwAnniversary1,
      title: "6th Anniversary of TFW",
      description: "Celebrating six years of excellence in trade finance",
      type: "image"
    },
    {
      video: tfwAnniversaryVideo,
      title: "5th Anniversary of TFW",
      description: "Celebrating our journey and milestones in trade finance",
      type: "video"
    },
    {
      image: tfwAnniversary2,
      title: "6th Anniversary of TFW",
      description: "Industry leaders gathering to commemorate our milestone",
      type: "image"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-advance slides with longer duration for videos
  useEffect(() => {
    const currentSlideType = slides[currentSlide].type;
    const interval = currentSlideType === 'video' ? 15000 : 5000; // 15s for video, 5s for images
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <div className="relative w-full h-96 lg:h-[500px] overflow-hidden bg-muted rounded-2xl shadow-premium group">
      {/* Images & Videos */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {slide.type === 'video' ? (
              <video
                src={slide.video}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-end">
              <div className="p-8 md:p-12 text-white transform transition-transform duration-500 group-hover:translate-y-0">
                <h3 className="professional-heading text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg">
                  {slide.title}
                </h3>
                <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
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
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-md text-white p-3 rounded-full border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-md text-white p-3 rounded-full border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide 
                ? 'w-8 h-3 bg-white' 
                : 'w-3 h-3 bg-white/50 hover:bg-white/70'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;