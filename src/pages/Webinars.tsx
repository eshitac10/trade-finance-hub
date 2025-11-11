import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, ExternalLink, Video, Sparkles, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Webinar {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
  videoUrl: string;
  description: string;
}


const Webinars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);
  const [newWebinarTitle, setNewWebinarTitle] = useState("");
  const [newWebinarDate, setNewWebinarDate] = useState("");
  const [newWebinarUrl, setNewWebinarUrl] = useState("");
  const [newWebinarDescription, setNewWebinarDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
    };
    
    checkAuth();
    loadWebinars();
  }, [navigate]);

  const loadWebinars = () => {
    const defaultWebinars: Webinar[] = [
      {
        id: "1",
        title: "Trade Finance Week Webinar",
        date: "2024",
        thumbnail: "https://img.youtube.com/vi/kNltHVO5bnY/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=kNltHVO5bnY",
        description: "Comprehensive insights into trade finance industry trends and developments"
      },
      {
        id: "2",
        title: "Trade Finance Insights",
        date: "2024",
        thumbnail: "https://img.youtube.com/vi/bbQH1a-QlEk/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=bbQH1a-QlEk",
        description: "Expert analysis on global trade finance markets and opportunities"
      },
      {
        id: "3",
        title: "Trade Finance Innovation",
        date: "2024",
        thumbnail: "https://img.youtube.com/vi/3tLP4qmcHnY/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=3tLP4qmcHnY",
        description: "Exploring innovative solutions transforming trade finance operations"
      },
      {
        id: "4",
        title: "Banking & Trade Finance",
        date: "2024",
        thumbnail: "https://img.youtube.com/vi/5YNt6cD_Riw/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=5YNt6cD_Riw",
        description: "Deep dive into banking solutions for international trade"
      },
      {
        id: "5",
        title: "Trade Finance Strategies",
        date: "2024",
        thumbnail: "https://img.youtube.com/vi/fi5KKNZFnAE/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=fi5KKNZFnAE",
        description: "Strategic approaches to managing trade finance portfolios"
      },
      {
        id: "6",
        title: "Digital Trade Finance",
        date: "2024",
        thumbnail: "https://img.youtube.com/vi/RsQHDdN1aZ4/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=RsQHDdN1aZ4",
        description: "Digital transformation in trade finance and banking sectors"
      },
      {
        id: "7",
        title: "Trade Finance Excellence",
        date: "2024",
        thumbnail: "https://img.youtube.com/vi/8pf-VdRZBuU/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=8pf-VdRZBuU",
        description: "Best practices and excellence standards in trade finance"
      }
    ];

    const savedWebinars = localStorage.getItem('webinars');
    if (savedWebinars) {
      setWebinars(JSON.parse(savedWebinars));
    } else {
      setWebinars(defaultWebinars);
      localStorage.setItem('webinars', JSON.stringify(defaultWebinars));
    }
  };

  const handleWebinarClick = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
  };

  const handleWatchOnYouTube = () => {
    if (selectedWebinar) {
      window.open(selectedWebinar.videoUrl, "_blank", "noopener,noreferrer");
      setSelectedWebinar(null);
    }
  };

  const handleAddWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebinarTitle.trim() || !newWebinarUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const videoId = newWebinarUrl.split("v=")[1]?.split("&")[0] || "";
      const newWebinar: Webinar = {
        id: Date.now().toString(),
        title: newWebinarTitle,
        date: newWebinarDate,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        videoUrl: newWebinarUrl,
        description: newWebinarDescription,
      };

      const updatedWebinars = [...webinars, newWebinar];
      setWebinars(updatedWebinars);
      localStorage.setItem('webinars', JSON.stringify(updatedWebinars));

      toast({
        title: "Success!",
        description: "Webinar added successfully.",
      });

      setNewWebinarTitle("");
      setNewWebinarDate("");
      setNewWebinarUrl("");
      setNewWebinarDescription("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add webinar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWebinar) return;

    setIsSubmitting(true);
    try {
      const videoId = editingWebinar.videoUrl.split("v=")[1]?.split("&")[0] || "";
      const updatedWebinar: Webinar = {
        ...editingWebinar,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };

      const updatedWebinars = webinars.map(w => w.id === updatedWebinar.id ? updatedWebinar : w);
      setWebinars(updatedWebinars);
      localStorage.setItem('webinars', JSON.stringify(updatedWebinars));

      toast({
        title: "Success!",
        description: "Webinar updated successfully.",
      });

      setEditingWebinar(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update webinar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWebinar = async (id: string) => {
    try {
      const updatedWebinars = webinars.filter(w => w.id !== id);
      setWebinars(updatedWebinars);
      localStorage.setItem('webinars', JSON.stringify(updatedWebinars));

      toast({
        title: "Success!",
        description: "Webinar deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete webinar",
        variant: "destructive",
      });
    }
  };

  const getEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background blur-3xl"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
              <Video className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <div className="flex items-center justify-between max-w-7xl mx-auto mb-6">
            <div className="flex-1">
              <h1 className="professional-heading text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                TFW Past Webinars
              </h1>
              <p className="banking-text text-xl sm:text-2xl text-muted-foreground max-w-3xl flex items-center justify-center gap-2 mx-auto">
                <Sparkles className="h-5 w-5 text-accent" />
                Access our comprehensive library of trade finance webinars and educational content
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webinar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="professional-heading text-2xl">Add New Webinar</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddWebinar} className="space-y-4">
                  <div>
                    <label className="banking-text text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={newWebinarTitle}
                      onChange={(e) => setNewWebinarTitle(e.target.value)}
                      placeholder="Enter webinar title..."
                      className="border-border/60"
                      required
                    />
                  </div>
                  <div>
                    <label className="banking-text text-sm font-medium mb-2 block">Date</label>
                    <Input
                      value={newWebinarDate}
                      onChange={(e) => setNewWebinarDate(e.target.value)}
                      placeholder="e.g., 2024"
                      className="border-border/60"
                      required
                    />
                  </div>
                  <div>
                    <label className="banking-text text-sm font-medium mb-2 block">YouTube URL</label>
                    <Input
                      value={newWebinarUrl}
                      onChange={(e) => setNewWebinarUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="border-border/60"
                      required
                    />
                  </div>
                  <div>
                    <label className="banking-text text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      value={newWebinarDescription}
                      onChange={(e) => setNewWebinarDescription(e.target.value)}
                      placeholder="Enter description..."
                      className="border-border/60"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground"
                  >
                    {isSubmitting ? "Adding..." : "Add Webinar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Webinars Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webinars.map((webinar, index) => (
              <Card
                key={webinar.id}
                className="group bg-gradient-to-br from-card to-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 overflow-hidden animate-scale-in relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-3 left-3 z-10 flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingWebinar(webinar);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="professional-heading text-2xl">Edit Webinar</DialogTitle>
                      </DialogHeader>
                      {editingWebinar && (
                        <form onSubmit={handleEditWebinar} className="space-y-4">
                          <div>
                            <label className="banking-text text-sm font-medium mb-2 block">Title</label>
                            <Input
                              value={editingWebinar.title}
                              onChange={(e) => setEditingWebinar({...editingWebinar, title: e.target.value})}
                              className="border-border/60"
                              required
                            />
                          </div>
                          <div>
                            <label className="banking-text text-sm font-medium mb-2 block">Date</label>
                            <Input
                              value={editingWebinar.date}
                              onChange={(e) => setEditingWebinar({...editingWebinar, date: e.target.value})}
                              className="border-border/60"
                              required
                            />
                          </div>
                          <div>
                            <label className="banking-text text-sm font-medium mb-2 block">YouTube URL</label>
                            <Input
                              value={editingWebinar.videoUrl}
                              onChange={(e) => setEditingWebinar({...editingWebinar, videoUrl: e.target.value})}
                              className="border-border/60"
                              required
                            />
                          </div>
                          <div>
                            <label className="banking-text text-sm font-medium mb-2 block">Description</label>
                            <Textarea
                              value={editingWebinar.description}
                              onChange={(e) => setEditingWebinar({...editingWebinar, description: e.target.value})}
                              className="border-border/60"
                              required
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground"
                          >
                            {isSubmitting ? "Updating..." : "Update Webinar"}
                          </Button>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWebinar(webinar.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div 
                  className="relative aspect-video overflow-hidden cursor-pointer"
                  onClick={() => handleWebinarClick(webinar)}
                >
                  <img
                    src={webinar.thumbnail}
                    alt={webinar.title}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://img.youtube.com/vi/${webinar.videoUrl.split("v=")[1]?.split("&")[0]}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-gradient-to-br from-primary to-accent rounded-full p-5 shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-10 w-10 text-primary-foreground fill-current" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold text-accent-foreground">{webinar.date}</span>
                  </div>
                </div>
                <CardContent className="p-6 relative">
                  <h3 className="professional-heading text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                    {webinar.title}
                  </h3>
                  <p className="banking-text text-muted-foreground text-sm leading-relaxed">
                    {webinar.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="h-4 w-4" />
                    <span className="text-sm font-semibold">Watch Now</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Dialog */}
      <Dialog open={!!selectedWebinar} onOpenChange={() => setSelectedWebinar(null)}>
        <DialogContent className="max-w-5xl bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="professional-heading text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {selectedWebinar?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl ring-2 ring-primary/20">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-border/30">
              <div>
                <p className="banking-text text-muted-foreground mb-1">{selectedWebinar?.description}</p>
                <p className="text-sm text-muted-foreground/70">Published: {selectedWebinar?.date}</p>
              </div>
              <Button
                onClick={handleWatchOnYouTube}
                className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 transition-all duration-300 text-primary-foreground shrink-0"
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
