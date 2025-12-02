import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, ExternalLink, Video, Sparkles, Plus, Trash2, Edit, Folder, ArrowLeft, Home } from "lucide-react";
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

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  coverImage?: string;
  modifiedTime?: string;
  createdTime?: string;
}

interface FolderHistory {
  id: string;
  name: string;
}

const ROOT_FOLDER_ID = "1oEhcHDdOVwcqf7emtjA0LzRwidmTaF86";

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
  const [driveItems, setDriveItems] = useState<DriveItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState(ROOT_FOLDER_ID);
  const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([{ id: ROOT_FOLDER_ID, name: "Webinars" }]);

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

  useEffect(() => {
    fetchDriveItems(currentFolderId);
  }, [currentFolderId]);

  const fetchDriveItems = async (folderId: string) => {
    setLoadingItems(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-google-drive', {
        body: { folderId }
      });

      if (error) {
        console.error('Error fetching Google Drive folder:', error);
        toast({
          title: "Error",
          description: "Failed to fetch items from Google Drive",
          variant: "destructive",
        });
        setLoadingItems(false);
        return;
      }

      // Sort items: folders first, then videos sorted by webinar number
      const sortedItems = (data.files || []).sort((a: DriveItem, b: DriveItem) => {
        const aIsFolder = a.mimeType === 'application/vnd.google-apps.folder';
        const bIsFolder = b.mimeType === 'application/vnd.google-apps.folder';
        
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        
        // For videos, sort by webinar number
        if (!aIsFolder && !bIsFolder) {
          const getWebinarNumber = (title: string) => {
            const match = title.match(/TFW\s+(\d+)(st|nd|rd|th)\s+Webinar/i);
            return match ? parseInt(match[1]) : 0;
          };
          return getWebinarNumber(a.name) - getWebinarNumber(b.name);
        }
        
        return a.name.localeCompare(b.name);
      });

      setDriveItems(sortedItems);
    } catch (error) {
      console.error('Error fetching Google Drive items:', error);
      toast({
        title: "Error",
        description: "An error occurred while fetching items",
        variant: "destructive",
      });
    } finally {
      setLoadingItems(false);
    }
  };

  const navigateToFolder = (folder: DriveItem) => {
    setFolderHistory(prev => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
  };

  const navigateBack = () => {
    if (folderHistory.length > 1) {
      const newHistory = [...folderHistory];
      newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolderId(newHistory[newHistory.length - 1].id);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    const newHistory = folderHistory.slice(0, index + 1);
    setFolderHistory(newHistory);
    setCurrentFolderId(newHistory[newHistory.length - 1].id);
  };

  const isVideo = (mimeType: string) => 
    mimeType.includes('video/') || mimeType === 'application/vnd.google-apps.video';
  
  const isFolder = (mimeType: string) => 
    mimeType === 'application/vnd.google-apps.folder';

  const folders = driveItems.filter(item => isFolder(item.mimeType));
  const videos = driveItems.filter(item => isVideo(item.mimeType));

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

  const handleItemClick = (item: DriveItem) => {
    if (isFolder(item.mimeType)) {
      navigateToFolder(item);
    }
  };

  const isInSubfolder = folderHistory.length > 1;
  const currentFolderName = folderHistory[folderHistory.length - 1]?.name || "Webinars";

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 text-foreground">
              Past Webinars
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
              Explore our collection of trade finance webinars and insights
            </p>
            <p className="text-sm text-muted-foreground">
              Total Videos: {videos.length}
            </p>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {folderHistory.map((folder, index) => (
              <div key={folder.id} className="flex items-center">
                {index > 0 && <span className="text-muted-foreground mx-2">/</span>}
                <Button
                  variant={index === folderHistory.length - 1 ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => navigateToBreadcrumb(index)}
                  className={index === folderHistory.length - 1 ? "font-semibold" : "text-muted-foreground hover:text-foreground"}
                >
                  {index === 0 ? <Home className="h-4 w-4 mr-1" /> : <Folder className="h-4 w-4 mr-1" />}
                  {folder.name}
                </Button>
              </div>
            ))}
          </div>

          {/* Back Button */}
          {isInSubfolder && (
            <Button
              variant="outline"
              onClick={navigateBack}
              className="mb-4 border-primary/20 hover:bg-primary/5"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {folderHistory[folderHistory.length - 2]?.name || "Previous Folder"}
            </Button>
          )}

          {/* Current Folder Info */}
          {isInSubfolder && (
            <div className="mb-6 p-4 bg-card/50 rounded-lg border border-border/50">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Folder className="h-5 w-5 text-accent" />
                {currentFolderName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {driveItems.length} item{driveItems.length !== 1 ? 's' : ''} in this folder
              </p>
            </div>
          )}

          {loadingItems ? (
            <div className="mb-12 text-center text-muted-foreground">
              Loading items from Google Drive...
            </div>
          ) : (
            <>
              {/* Folders Section */}
              {folders.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Folder className="h-6 w-6 text-accent" />
                    Folders
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {folders.map((folder) => (
                      <Card 
                        key={folder.id} 
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/20 cursor-pointer group"
                        onClick={() => handleItemClick(folder)}
                      >
                        <CardContent className="p-6">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-accent/20 to-primary/10 mb-4 flex items-center justify-center">
                            {folder.coverImage ? (
                              <img
                                src={folder.coverImage.replace('=s220', '=s800')}
                                alt={folder.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <Folder className="h-20 w-20 text-accent/60" />
                            )}
                          </div>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1 group-hover:text-accent transition-colors">{folder.name}</h3>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <ArrowLeft className="h-3 w-3 rotate-180" />
                                Click to open
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Section */}
              {videos.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Video className="h-6 w-6 text-primary" />
                    Videos
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {videos.map((video) => (
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
                                {video.modifiedTime || video.createdTime
                                  ? new Date(video.modifiedTime || video.createdTime!).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: '2-digit'
                                    })
                                  : ''}
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
                </div>
              )}

              {/* Empty State */}
              {driveItems.length === 0 && (
                <div className="text-center py-20">
                  {isInSubfolder ? (
                    <>
                      <Folder className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-2xl font-semibold mb-2">Empty Folder</h3>
                      <p className="text-muted-foreground mb-4">
                        This folder doesn't have any items yet
                      </p>
                      <Button
                        variant="outline"
                        onClick={navigateBack}
                        className="border-primary/20 hover:bg-primary/5"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                      </Button>
                    </>
                  ) : (
                    <>
                      <Video className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-2xl font-semibold mb-2">No Webinars Found</h3>
                      <p className="text-muted-foreground">
                        No webinars available at the moment
                      </p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Webinars;
