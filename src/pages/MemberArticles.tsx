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
import { FileText, Search, ExternalLink, TrendingUp, Clock, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Article {
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
}

const MemberArticles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newArticleName, setNewArticleName] = useState("");
  const [newArticleUrl, setNewArticleUrl] = useState("");
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
    fetchArticles();
    
    const channel = supabase
      .channel('google_drive_articles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'google_drive_articles'
        },
        () => {
          fetchArticles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('google_drive_articles')
        .select('id, name, file_id, ai_thumbnail, thumbnail_link, mime_type, web_view_link, created_time, modified_time, synced_at')
        .order('modified_time', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
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

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticleName.trim() || !newArticleUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('google_drive_articles').insert({
        name: newArticleName,
        file_id: `manual_${Date.now()}`,
        web_view_link: newArticleUrl,
        mime_type: 'application/pdf',
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Article added successfully.",
      });

      setNewArticleName("");
      setNewArticleUrl("");
      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add article",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('google_drive_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

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

  const filteredArticles = articles.filter((article) =>
    article.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openArticle = (articleId: string) => {
    navigate(`/article/${articleId}`);
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

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Article
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
                <DialogHeader>
                  <DialogTitle className="professional-heading text-2xl">Add New Article</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddArticle} className="space-y-4">
                  <div>
                    <label className="banking-text text-sm font-medium mb-2 block">Article Name</label>
                    <Input
                      value={newArticleName}
                      onChange={(e) => setNewArticleName(e.target.value)}
                      placeholder="Enter article name..."
                      className="border-border/60"
                      required
                    />
                  </div>
                  <div>
                    <label className="banking-text text-sm font-medium mb-2 block">Article URL</label>
                    <Input
                      value={newArticleUrl}
                      onChange={(e) => setNewArticleUrl(e.target.value)}
                      placeholder="Enter article URL..."
                      className="border-border/60"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground"
                  >
                    {isSubmitting ? "Adding..." : "Add Article"}
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
            {filteredArticles.map((article) => (
              <Card 
                key={article.id} 
                className="bg-card dark:bg-card backdrop-blur-xl border-border/60 hover:shadow-premium transition-all duration-300 hover:scale-[1.03] group overflow-hidden relative"
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => openArticle(article.id)}
                >
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 overflow-hidden">
                    {article.ai_thumbnail ? (
                      <img 
                        src={article.ai_thumbnail} 
                        alt={article.name}
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
                        Article
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <CardContent className="p-6">
                    <h3 className="banking-text text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.name}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground banking-text">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {article.modified_time 
                            ? new Date(article.modified_time).toLocaleDateString('en-US', { 
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
                      handleDeleteArticle(article.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberArticles;
