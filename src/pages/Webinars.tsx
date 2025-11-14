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
  const [gDriveVideo, setGDriveVideo] = useState<any>(null);

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
    fetchGDriveVideo();
  }, [navigate]);

  const fetchGDriveVideo = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-google-drive', {
        body: { fileId: '18d_fdnYzrpgf62R6ETTm6sn_5NAjWUD-' }
      });

      if (error) throw error;
      if (data?.file) {
        setGDriveVideo(data.file);
      }
    } catch (error) {
      console.error('Error fetching Google Drive video:', error);
    }
  };

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
        <div className="relative max-w-7xl mx-auto text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
              <Video className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="professional-heading text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            TFW Past Webinars
          </h1>
          <p className="banking-text text-xl sm:text-2xl text-muted-foreground max-w-3xl flex items-center justify-center gap-2 mx-auto">
            <Sparkles className="h-5 w-5 text-accent" />
            Access our comprehensive library of trade finance webinars and educational content
          </p>
        </div>
      </section>

      {/* Google Drive Video Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {gDriveVideo ? (
            <Card className="group relative overflow-hidden border-border/60 bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:border-accent/50 transition-all duration-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="professional-heading text-xl font-semibold">{gDriveVideo.name}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(gDriveVideo.webViewLink, '_blank')}
                    className="border-accent/50 hover:bg-accent/10"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Drive
                  </Button>
                </div>
                {gDriveVideo.mimeType?.includes('video') && (
                  <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
                    <video
                      controls
                      className="w-full h-full rounded-lg"
                      src={gDriveVideo.webContentLink}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Loading video...</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Webinars;
