import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  id: string;
  file_id: string;
  name: string;
  content: string | null;
  ai_thumbnail: string | null;
  created_time: string | null;
  modified_time: string | null;
}

const ArticleDetail = () => {
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
      const { data, error } = await supabase
        .from('google_drive_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: "Error",
        description: "Failed to load article",
        variant: "destructive",
      });
      navigate('/member-articles');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card className="bg-card/50 backdrop-blur-xl border-border/60">
            <CardHeader>
              <Skeleton className="h-64 w-full mb-4" />
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/member-articles')}
          className="mb-6 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </Button>

        <Card className="bg-card/50 backdrop-blur-xl border-border/60 shadow-premium">
          <CardHeader className="p-0">
            {/* Hero Image */}
            <div className="relative h-80 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden rounded-t-2xl">
              {article.ai_thumbnail ? (
                <img 
                  src={article.ai_thumbnail}
                  alt={article.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="h-24 w-24 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Article Header */}
            <div className="p-8 pb-4">
              <h1 className="professional-heading text-4xl font-bold mb-4">
                {article.name}
              </h1>
              
              <div className="flex items-center gap-4 text-muted-foreground banking-text">
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
            </div>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            {/* Article Content */}
            <div className="prose prose-lg max-w-none banking-text">
              {article.content ? (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {article.content.split('\n').map((paragraph, index) => {
                    // Handle headings
                    if (paragraph.startsWith('# ')) {
                      return (
                        <h2 key={index} className="professional-heading text-2xl font-bold mt-8 mb-4">
                          {paragraph.substring(2)}
                        </h2>
                      );
                    }
                    // Handle bullet points
                    if (paragraph.startsWith('• ')) {
                      return (
                        <li key={index} className="ml-6 mb-2">
                          {paragraph.substring(2)}
                        </li>
                      );
                    }
                    // Handle regular paragraphs
                    if (paragraph.trim()) {
                      return (
                        <p key={index} className="mb-4 text-foreground/90">
                          {paragraph}
                        </p>
                      );
                    }
                    return <br key={index} />;
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No content available for this article.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArticleDetail;
