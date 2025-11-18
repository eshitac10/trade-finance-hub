import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Search, Folder, ExternalLink, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GoogleDriveItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  coverImage?: string;
  createdTime?: string;
  modifiedTime?: string;
}

const ArticlesGoogleDrive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<GoogleDriveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
    };
    
    checkAuth();
    fetchGoogleDriveItems();
  }, [navigate]);

  const fetchGoogleDriveItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-google-drive', {
        body: { folderId: '1ue-dkScVVjq4abyCxP81GbUZgO6M8gTa' }
      });

      if (error) throw error;

      if (data?.files) {
        setItems(data.files);
      }
    } catch (error: any) {
      console.error('Error fetching Google Drive items:', error);
      toast({
        title: "Error",
        description: "Failed to load articles from Google Drive",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredItems.filter(item => item.mimeType === 'application/vnd.google-apps.folder');
  const files = filteredItems.filter(item => item.mimeType !== 'application/vnd.google-apps.folder');

  const openItem = (item: GoogleDriveItem) => {
    if (item.webViewLink) {
      window.open(item.webViewLink, '_blank');
    }
  };

  const getThumbnail = (item: GoogleDriveItem) => {
    if (item.mimeType === 'application/vnd.google-apps.folder') {
      return item.coverImage || item.iconLink;
    }
    return item.thumbnailLink || item.iconLink;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="professional-heading text-5xl md:text-6xl font-bold mb-4 text-foreground">
            Articles & Resources
          </h1>
          <p className="banking-text text-lg text-muted-foreground max-w-2xl">
            Browse our collection of trade finance articles and resources from Google Drive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card backdrop-blur-xl border-border/60">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold text-foreground">{files.length}</p>
                <p className="banking-text text-sm text-muted-foreground">Files</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card backdrop-blur-xl border-border/60">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Folder className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold text-foreground">{folders.length}</p>
                <p className="banking-text text-sm text-muted-foreground">Folders</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card backdrop-blur-xl border-border/60">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold text-foreground">{filteredItems.length}</p>
                <p className="banking-text text-sm text-muted-foreground">Available</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/60"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {folders.length > 0 && (
              <div className="mb-12">
                <h2 className="professional-heading text-2xl font-bold mb-6 flex items-center gap-2">
                  <Folder className="h-6 w-6 text-accent" />
                  Folders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {folders.map((folder) => (
                    <Card
                      key={folder.id}
                      className="group overflow-hidden bg-card/50 backdrop-blur-xl border-border/60 hover:shadow-premium transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                      onClick={() => openItem(folder)}
                    >
                      <div className="relative h-48 bg-gradient-to-br from-accent/20 to-primary/10 overflow-hidden flex items-center justify-center">
                        {getThumbnail(folder) ? (
                          <img
                            src={getThumbnail(folder)}
                            alt={folder.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <Folder className="h-20 w-20 text-accent/60" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-accent/90 backdrop-blur-sm text-accent-foreground border-accent/60">
                            <Folder className="h-3 w-3 mr-1" />
                            Folder
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="banking-text text-lg font-semibold mb-2 line-clamp-2 group-hover:text-accent transition-colors duration-300">
                          {folder.name}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground banking-text">
                          <ExternalLink className="h-4 w-4 mr-2 group-hover:text-accent transition-colors" />
                          <span>Open in Drive</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div>
                <h2 className="professional-heading text-2xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {files.map((file) => (
                    <Card
                      key={file.id}
                      className="group overflow-hidden bg-card/50 backdrop-blur-xl border-border/60 hover:shadow-premium transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                      onClick={() => openItem(file)}
                    >
                      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden">
                        {getThumbnail(file) ? (
                          <img
                            src={getThumbnail(file)}
                            alt={file.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <FileText className="h-20 w-20 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-border/60">
                            <FileText className="h-3 w-3 mr-1" />
                            Article
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="banking-text text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                          {file.name}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground banking-text">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {file.modifiedTime
                                ? new Date(file.modifiedTime).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                          <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300 group-hover:text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {filteredItems.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <FileText className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="professional-heading text-2xl mb-2">No Articles Found</h3>
                <p className="banking-text text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "No articles available at the moment"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArticlesGoogleDrive;
