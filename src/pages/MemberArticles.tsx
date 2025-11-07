import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Search, RefreshCw, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  id: string;
  file_id: string;
  name: string;
  mime_type: string;
  web_view_link: string | null;
  thumbnail_link: string | null;
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
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    
    fetchArticles();
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

  const syncWithGoogleDrive = async () => {
    try {
      setIsSyncing(true);
      const { data, error } = await supabase.functions.invoke('sync-google-drive');

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Synced ${data.synced} articles from Google Drive`,
      });

      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error syncing:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync with Google Drive",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
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
        <div className="mb-8">
          <h1 className="professional-heading text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Member Articles
          </h1>
          <p className="banking-text text-lg text-muted-foreground">
            Access trade finance articles and resources from our Google Drive repository
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 banking-text border-border/60 rounded-xl"
            />
          </div>
          <Button
            onClick={syncWithGoogleDrive}
            disabled={isSyncing}
            className="bg-gradient-primary hover:shadow-elegant text-primary-foreground font-semibold px-6 rounded-xl transition-all hover:scale-[1.02]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync with Drive'}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-xl border-border/60">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-xl border-border/60 text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="banking-text text-lg text-muted-foreground">
                {searchQuery ? 'No articles found matching your search' : 'No articles available. Click "Sync with Drive" to load articles.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card 
                key={article.id} 
                className="bg-card/50 backdrop-blur-xl border-border/60 hover:shadow-elegant transition-all hover:scale-[1.02] cursor-pointer group"
                onClick={() => openArticle(article.web_view_link)}
              >
                <CardHeader>
                  <CardTitle className="banking-text text-lg flex items-start gap-2">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <span className="line-clamp-2 group-hover:text-primary transition-colors">
                      {article.name}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground banking-text">
                    <span>
                      {article.modified_time 
                        ? new Date(article.modified_time).toLocaleDateString()
                        : 'No date'}
                    </span>
                    <ExternalLink className="h-4 w-4 group-hover:text-primary transition-colors" />
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