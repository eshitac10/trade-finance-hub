import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Search, ExternalLink, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuth) {
      navigate("/");
      return;
    }
    
    fetchArticles();
    
    // Set up realtime subscription for automatic updates
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
          console.log('Articles updated, refreshing...');
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
        .select('*')
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


  const filteredArticles = articles.filter((article) =>
    article.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openArticle = (webViewLink: string | null) => {
    if (webViewLink) {
      window.open(webViewLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="professional-heading text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Member Articles
          </h1>
          <p className="banking-text text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of trade finance insights, research, and industry knowledge
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur-xl border-border/60">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold">{articles.length}</p>
                <p className="banking-text text-sm text-muted-foreground">Total Articles</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-xl border-border/60">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold">{filteredArticles.length}</p>
                <p className="banking-text text-sm text-muted-foreground">Available Now</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-xl border-border/60">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold">Updated</p>
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
                className="bg-card/50 backdrop-blur-xl border-border/60 hover:shadow-premium transition-all duration-300 hover:scale-[1.03] cursor-pointer group overflow-hidden"
                onClick={() => openArticle(article.web_view_link)}
              >
                {/* AI-Generated Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                  {article.ai_thumbnail ? (
                    <img 
                      src={article.ai_thumbnail} 
                      alt={article.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-16 w-16 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-border/60">
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberArticles;