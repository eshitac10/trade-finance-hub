import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  id: string;
  name: string;
  content: string | null;
  created_time: string | null;
  modified_time: string | null;
  ai_thumbnail: string | null;
}

const ArticleView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setIsLoading(true);
      
      // Try google_drive_articles first
      const { data: googleData, error: googleError } = await supabase
        .from('google_drive_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (googleData && !googleError) {
        setArticle(googleData);
        setIsLoading(false);
        return;
      }

      // If not found, try user_articles
      const { data: userData, error: userError } = await supabase
        .from('user_articles')
        .select('id, title, description, file_path, thumbnail_url, created_at, updated_at')
        .eq('id', id)
        .single();

      if (userError) throw userError;

      // Get public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('articles')
        .getPublicUrl(userData.file_path);

      // Transform user_article to match Article interface
      setArticle({
        id: userData.id,
        name: userData.title,
        content: userData.description || null,
        created_time: userData.created_at,
        modified_time: userData.updated_at,
        ai_thumbnail: userData.thumbnail_url || publicUrl,
      });
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: "Error",
        description: "Failed to load article",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <Button onClick={() => navigate('/member-articles')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/member-articles')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Button>

        {article.ai_thumbnail && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img 
              src={article.ai_thumbnail} 
              alt={article.name}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        <article className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-professional">
          <h1 className="professional-heading text-4xl font-bold mb-4">{article.name}</h1>
          
          <div className="flex items-center gap-4 text-muted-foreground banking-text mb-8 pb-8 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {article.modified_time 
                  ? new Date(article.modified_time).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'No date'}
              </span>
            </div>
          </div>

          <div className="banking-text prose prose-lg max-w-none">
            {article.content ? (
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {article.content}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Article content not available</p>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleView;
