import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Image as ImageIcon, Video, FileText, ExternalLink } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
  coverImage?: string;
}

const MemoriesGoogleDrive = () => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDriveFiles();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDriveFiles, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDriveFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-google-drive');
      
      if (error) throw error;
      
      if (data?.files) {
        setFiles(data.files);
      }
    } catch (error: any) {
      console.error('Error fetching Drive files:', error);
      toast({
        title: "Error",
        description: "Failed to load memories from Google Drive",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');
  const isVideo = (mimeType: string) => mimeType.startsWith('video/');
  const isFolder = (mimeType: string) => mimeType === 'application/vnd.google-apps.folder';
  const isDocument = (mimeType: string) => 
    mimeType.includes('pdf') || 
    mimeType.includes('document') || 
    mimeType.includes('word') || 
    mimeType.includes('text') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation');

  const getThumbnail = (file: DriveFile) => {
    if (file.thumbnailLink) {
      return file.thumbnailLink.replace('=s220', '=s800');
    }
    return null;
  };

  const openFile = (file: DriveFile) => {
    const url = file.webViewLink || file.webContentLink;
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent helvetica-bold">
                  Memories
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  Connected to Google Drive Folder • Auto-refreshes every 30 seconds
                </p>
              </div>
              <Button 
                onClick={fetchDriveFiles}
                disabled={loading}
                variant="outline"
                className="border-primary/20 hover:bg-primary/5"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Refreshing...</>
                ) : (
                  'Refresh Now'
                )}
              </Button>
            </div>
            
            <div className="h-1 w-24 bg-gradient-to-r from-primary via-accent to-gold rounded-full shadow-gold"></div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Grid Gallery */}
          {!loading && files.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
              {files.map((file, index) => (
                <Card 
                  key={file.id}
                  className="group relative overflow-hidden border-border/50 shadow-lg bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => {
                    if (isImage(file.mimeType)) {
                      const thumbnail = getThumbnail(file);
                      if (thumbnail) setSelectedImage(thumbnail);
                    } else {
                      openFile(file);
                    }
                  }}
                >
                  <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-background to-accent/5">
                    {isFolder(file.mimeType) && (
                      <div className="w-full h-full relative">
                        {file.coverImage ? (
                          <img
                            src={file.coverImage.replace('=s220', '=s800')}
                            alt={file.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gold/20 to-primary/20 flex items-center justify-center">
                            <div className="text-center">
                              <div className="p-5 rounded-full bg-background/50 backdrop-blur-sm inline-block mb-2">
                                <svg className="h-16 w-16 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                              </div>
                              <p className="text-xs text-muted-foreground font-medium">Folder</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-gold/90 backdrop-blur-sm px-2 py-1 rounded-full">
                          <span className="text-xs font-semibold text-primary-foreground">📁 Folder</span>
                        </div>
                      </div>
                    )}
                    
                    {isImage(file.mimeType) && getThumbnail(file) && (
                      <img
                        src={getThumbnail(file)!}
                        alt={file.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    
                    {isVideo(file.mimeType) && (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex flex-col items-center justify-center gap-3">
                        <div className="p-4 rounded-full bg-background/50 backdrop-blur-sm">
                          <Video className="h-12 w-12 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">Click to play</span>
                      </div>
                    )}

                    {isDocument(file.mimeType) && (
                      <div className="w-full h-full bg-gradient-to-br from-accent/10 to-primary/10 flex flex-col items-center justify-center gap-3">
                        <div className="p-4 rounded-full bg-background/50 backdrop-blur-sm">
                          <FileText className="h-12 w-12 text-accent" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium px-4 text-center">Click to open</span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                      <div className="p-4 w-full">
                        <p className="text-white text-sm font-semibold truncate mb-2">{file.name}</p>
                        <div className="flex items-center gap-2">
                          {isFolder(file.mimeType) && (
                            <span className="text-xs text-white/90 flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                              📁 Folder
                            </span>
                          )}
                          {isImage(file.mimeType) && (
                            <span className="text-xs text-white/90 flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                              <ImageIcon className="h-3 w-3" />
                              Image
                            </span>
                          )}
                          {isVideo(file.mimeType) && (
                            <span className="text-xs text-white/90 flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                              <Video className="h-3 w-3" />
                              Video
                            </span>
                          )}
                          {isDocument(file.mimeType) && (
                            <span className="text-xs text-white/90 flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                              <FileText className="h-3 w-3" />
                              Document
                            </span>
                          )}
                          <ExternalLink className="h-3 w-3 text-white/80 ml-auto" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && files.length === 0 && (
            <Card className="p-12 text-center border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full">
                  <ImageIcon className="h-12 w-12 text-primary/40" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No Memories Yet</h3>
                  <p className="text-muted-foreground">
                    Upload files to the connected Google Drive folder to see them here
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-7xl w-full p-0 bg-black/95 border-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full size"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemoriesGoogleDrive;
