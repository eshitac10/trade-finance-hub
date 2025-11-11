import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Search, ExternalLink, TrendingUp, Clock, Plus, Trash2, Upload as UploadIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface GoogleDriveArticle {
  id: string;
  file_id: string;
  name: string;
  mime_type: string;
  web_view_link: string | null;
  thumbnail_link: string | null;
  ai_thumbnail: string | null;
  created_time: string | null;
  modified_time: string | null;
  synced_at: string;
  source: 'google_drive';
}

interface UserArticle {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  source: 'user_upload';
}

type Article = GoogleDriveArticle | UserArticle;

const MemberArticles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newArticleTitle, setNewArticleTitle] = useState("");
  const [newArticleDescription, setNewArticleDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
    };
    
    checkAuth();
    fetchArticles();
  }, [navigate]);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      
      // Fetch Google Drive articles
      const { data: googleArticles, error: googleError } = await supabase
        .from('google_drive_articles')
        .select('id, name, file_id, ai_thumbnail, thumbnail_link, mime_type, web_view_link, created_time, modified_time, synced_at')
        .order('modified_time', { ascending: false });

      if (googleError) throw googleError;

      // Fetch user-uploaded articles
      const { data: userArticles, error: userError } = await supabase
        .from('user_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      // Combine and transform articles
      const combinedArticles: Article[] = [
        ...(googleArticles || []).map(article => ({ ...article, source: 'google_drive' as const })),
        ...(userArticles || []).map(article => ({ ...article, source: 'user_upload' as const }))
      ];

      setArticles(combinedArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticleTitle.trim() || !selectedFile) {
      toast({
        title: "Error",
        description: "Please provide a title and select a file",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('articles')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('articles')
        .getPublicUrl(fileName);

      // Insert article metadata
      const { error: insertError } = await supabase
        .from('user_articles')
        .insert({
          user_id: user.id,
          title: newArticleTitle,
          description: newArticleDescription || null,
          file_path: fileName,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          thumbnail_url: publicUrl
        });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "Article uploaded successfully.",
      });

      setNewArticleTitle("");
      setNewArticleDescription("");
      setSelectedFile(null);
      setIsDialogOpen(false);
      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload article",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArticle = async (article: Article) => {
    try {
      if (article.source === 'user_upload') {
        const userArticle = article as UserArticle;
        
        // Delete file from storage
        const { error: storageError } = await supabase.storage
          .from('articles')
          .remove([userArticle.file_path]);

        if (storageError) throw storageError;

        // Delete from database
        const { error: dbError } = await supabase
          .from('user_articles')
          .delete()
          .eq('id', userArticle.id);

        if (dbError) throw dbError;
      } else {
        const { error } = await supabase
          .from('google_drive_articles')
          .delete()
          .eq('id', article.id);

        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: "Article deleted successfully.",
      });

      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  const filteredArticles = articles.filter((article) => {
    const title = article.source === 'google_drive' 
      ? (article as GoogleDriveArticle).name 
      : (article as UserArticle).title;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openArticle = async (article: Article) => {
    if (article.source === 'google_drive') {
      const googleArticle = article as GoogleDriveArticle;
      if (googleArticle.web_view_link) {
        window.open(googleArticle.web_view_link, '_blank');
      }
    } else {
      const userArticle = article as UserArticle;
      // Get the file from storage
      const { data } = supabase.storage
        .from('articles')
        .getPublicUrl(userArticle.file_path);
      
      if (data.publicUrl) {
        window.open(data.publicUrl, '_blank');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-justify">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="professional-heading text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Member Articles
              </h1>
              <p className="banking-text text-lg text-muted-foreground max-w-2xl">
                Explore our curated collection of trade finance insights, research, and industry knowledge
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground font-bold">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Article
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="professional-heading text-2xl">Upload New Article</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUploadArticle} className="space-y-4">
                  <div>
                    <Label className="banking-text text-sm font-medium mb-2 block">Article Title *</Label>
                    <Input
                      value={newArticleTitle}
                      onChange={(e) => setNewArticleTitle(e.target.value)}
                      placeholder="Enter article title..."
                      className="border-border/60"
                      required
                    />
                  </div>
                  <div>
                    <Label className="banking-text text-sm font-medium mb-2 block">Description (Optional)</Label>
                    <Textarea
                      value={newArticleDescription}
                      onChange={(e) => setNewArticleDescription(e.target.value)}
                      placeholder="Enter article description..."
                      className="border-border/60 min-h-24"
                    />
                  </div>
                  <div>
                    <Label className="banking-text text-sm font-medium mb-2 block">Article File *</Label>
                    <div className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 52428800) {
                              toast({
                                title: "File too large",
                                description: "Maximum file size is 50MB",
                                variant: "destructive",
                              });
                              return;
                            }
                            setSelectedFile(file);
                          }
                        }}
                        required
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <UploadIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="banking-text text-sm text-foreground mb-1">
                          {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="banking-text text-xs text-muted-foreground">
                          PDF, DOC, DOCX, JPG, PNG, WEBP (Max 50MB)
                        </p>
                      </label>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground font-bold"
                  >
                    {isSubmitting ? "Uploading..." : "Upload Article"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card dark:bg-card backdrop-blur-xl border-border/60">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary dark:text-primary" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold text-foreground">{articles.length}</p>
                <p className="banking-text text-sm text-muted-foreground">Total Articles</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card dark:bg-card backdrop-blur-xl border-border/60">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500 dark:text-green-400" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold text-foreground">{filteredArticles.length}</p>
                <p className="banking-text text-sm text-muted-foreground">Available Now</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card dark:bg-card backdrop-blur-xl border-border/60">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold text-foreground">Updated</p>
                <p className="banking-text text-sm text-muted-foreground">Recently Added</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search articles by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 banking-text border-border/60 rounded-xl h-12"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-xl border-border/60 overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-xl border-border/60 text-center py-16">
            <CardContent>
              <div className="h-20 w-20 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="professional-heading text-xl font-semibold mb-2">No Articles Found</h3>
              <p className="banking-text text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms' : 'No articles available at the moment'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const isGoogleDrive = article.source === 'google_drive';
              const title = isGoogleDrive ? (article as GoogleDriveArticle).name : (article as UserArticle).title;
              const thumbnail = isGoogleDrive 
                ? (article as GoogleDriveArticle).ai_thumbnail 
                : (article as UserArticle).thumbnail_url;
              const date = isGoogleDrive 
                ? (article as GoogleDriveArticle).modified_time 
                : (article as UserArticle).created_at;

              return (
                <Card 
                  key={article.id} 
                  className="bg-card dark:bg-card backdrop-blur-xl border-border/60 hover:shadow-premium transition-all duration-300 hover:scale-[1.03] group overflow-hidden relative"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => openArticle(article)}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 overflow-hidden">
                      {thumbnail ? (
                        <img 
                          src={thumbnail} 
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-16 w-16 text-primary/40 dark:text-primary/60" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-background/90 dark:bg-background/90 backdrop-blur-sm text-foreground border-border/60">
                          <FileText className="h-3 w-3 mr-1" />
                          {isGoogleDrive ? 'Drive' : 'Uploaded'}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <CardContent className="p-6">
                      <h3 className="banking-text text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground banking-text">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {date 
                              ? new Date(date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : 'No date'}
                          </span>
                        </div>
                        <ExternalLink className="h-4 w-4 group-hover:text-primary group-hover:scale-110 transition-all" />
                      </div>
                    </CardContent>
                  </div>

                  <div className="absolute top-3 left-3 z-10">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteArticle(article);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberArticles;
