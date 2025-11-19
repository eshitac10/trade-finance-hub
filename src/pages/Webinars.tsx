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
      // Fetch videos from the specified Google Drive folder
      const { data, error } = await supabase.functions.invoke('fetch-google-drive', {
        body: { folderId: '1oEhcHDdOVwcqf7emtjA0LzRwidmTaF86' }
      });

      if (error) {
        console.error('Error fetching Google Drive folder:', error);
        toast({
          title: "Error",
          description: "Failed to fetch webinars from Google Drive",
          variant: "destructive",
        });
        setLoadingVideos(false);
        return;
      }

      // Filter for video files only and map to expected format
      const videoFiles = (data.files || [])
        .filter((file: any) => 
          file.mimeType && (
            file.mimeType.includes('video/') || 
            file.mimeType === 'application/vnd.google-apps.video'
          )
        )
        .map((file: any) => ({
          ...file,
          name: file.name,
          date: new Date(file.modifiedTime || file.createdTime).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: '2-digit'
          })
        }))
        .sort((a: any, b: any) => {
          // Extract webinar number from title (e.g., "TFW 18th Webinar" -> 18)
          const getWebinarNumber = (title: string) => {
            const match = title.match(/TFW\s+(\d+)(st|nd|rd|th)\s+Webinar/i);
            return match ? parseInt(match[1]) : 0;
          };
          
          const numA = getWebinarNumber(a.name);
          const numB = getWebinarNumber(b.name);
          
          return numA - numB;
        });

      setGDriveVideos(videoFiles);
    } catch (error) {
      console.error('Error fetching Google Drive videos:', error);
      toast({
        title: "Error",
        description: "An error occurred while fetching webinars",
        variant: "destructive",
      });
    } finally {
      setLoadingVideos(false);
    }
  };

  const loadWebinars = () => {
    const defaultWebinars: Webinar[] = [];
    
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
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
              Explore our collection of trade finance webinars and insights
            </p>
            <p className="text-sm text-muted-foreground">
              Total Webinars: {gDriveVideos.length}
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
                        <p className="text-xs text-muted-foreground">
                          {video.date}
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
