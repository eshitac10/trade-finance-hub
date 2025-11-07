import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface Webinar {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
  videoUrl: string;
  description: string;
}

const Webinars = () => {
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);

  // Sample webinars - replace with your actual YouTube video URLs
  const webinars: Webinar[] = [
    {
      id: "1",
      title: "Trade Finance Fundamentals",
      date: "October 2025",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "An introduction to trade finance concepts and best practices"
    },
    {
      id: "2",
      title: "Digital Transformation in Banking",
      date: "September 2025",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Exploring digital innovations in the banking sector"
    },
    {
      id: "3",
      title: "Risk Management Strategies",
      date: "August 2025",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Advanced risk management techniques for trade finance"
    },
    {
      id: "4",
      title: "Compliance and Regulations",
      date: "July 2025",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Understanding regulatory requirements in international trade"
    },
    {
      id: "5",
      title: "Letter of Credit Best Practices",
      date: "June 2025",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Mastering letter of credit operations and documentation"
    },
    {
      id: "6",
      title: "Trade Finance Technology Trends",
      date: "May 2025",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Latest technological innovations transforming trade finance"
    }
  ];

  const handleWebinarClick = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
  };

  const handleWatchOnYouTube = () => {
    if (selectedWebinar) {
      window.open(selectedWebinar.videoUrl, "_blank", "noopener,noreferrer");
      setSelectedWebinar(null);
    }
  };

  const getEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="professional-heading text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            TFW Webinars
          </h1>
          <p className="banking-text text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Access our comprehensive library of trade finance webinars and educational content
          </p>
        </div>
      </section>

      {/* Webinars Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webinars.map((webinar) => (
              <Card
                key={webinar.id}
                className="group bg-card/60 backdrop-blur-xl border border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-premium cursor-pointer overflow-hidden"
                onClick={() => handleWebinarClick(webinar)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={webinar.thumbnail}
                    alt={webinar.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-primary rounded-full p-4">
                      <Play className="h-8 w-8 text-primary-foreground fill-current" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="banking-text text-sm text-muted-foreground mb-2">{webinar.date}</p>
                  <h3 className="professional-heading text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {webinar.title}
                  </h3>
                  <p className="banking-text text-muted-foreground text-sm">
                    {webinar.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Dialog */}
      <Dialog open={!!selectedWebinar} onOpenChange={() => setSelectedWebinar(null)}>
        <DialogContent className="max-w-4xl bg-card/98 backdrop-blur-xl border border-border/60 shadow-premium">
          <DialogHeader>
            <DialogTitle className="professional-heading text-2xl">{selectedWebinar?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              {selectedWebinar && (
                <iframe
                  src={getEmbedUrl(selectedWebinar.videoUrl)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedWebinar.title}
                />
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="banking-text text-muted-foreground">{selectedWebinar?.description}</p>
              <Button
                onClick={handleWatchOnYouTube}
                className="bg-gradient-primary hover:shadow-accent text-primary-foreground"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Watch on YouTube
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Webinars;
