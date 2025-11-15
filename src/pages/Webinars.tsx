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
  const [gDriveVideos, setGDriveVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

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
    fetchGDriveVideos();
  }, [navigate]);

  const fetchGDriveVideos = async () => {
    setLoadingVideos(true);
    try {
      // Extract file IDs from the Google Drive links
      const fileIds = [
        '1HAPaEe1On_dlEBQezBr3r6o-cEZau20m',
        '1MbYPNi2zjSXpe6SN64K-n1K_IKr4Xd3K'
      ];

      const videoPromises = fileIds.map(fileId =>
        supabase.functions.invoke('fetch-google-drive', {
          body: { fileId }
        })
      );

      const results = await Promise.all(videoPromises);
      const videos = results
        .filter(result => !result.error && result.data?.file)
        .map(result => result.data.file);

      setGDriveVideos(videos);
    } catch (error) {
      console.error('Error fetching Google Drive videos:', error);
    } finally {
      setLoadingVideos(false);
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
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Past Webinars
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of trade finance webinars and insights
            </p>
          </div>

          {loadingVideos ? (
            <div className="mb-12 text-center text-muted-foreground">
              Loading webinars from Google Drive...
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {gDriveVideos.map((video, index) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/20">
                  <CardContent className="p-6">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-4">
                      <iframe
                        src={`https://drive.google.com/file/d/${video.id}/preview`}
                        width="100%"
                        height="100%"
                        allow="autoplay"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{video.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Webinar {index + 1}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(video.webViewLink, '_blank')}
                        className="ml-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Webinars;
