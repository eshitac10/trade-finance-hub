import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Clock, FileText, TrendingUp } from 'lucide-react';
import CreativeLoader from '@/components/CreativeLoader';
import generatedArticle1 from '@/assets/generated-article-1.jpg';
import generatedArticle2 from '@/assets/generated-article-2.jpg';
import generatedArticle3 from '@/assets/generated-article-3.jpg';
import generatedArticle4 from '@/assets/generated-article-4.jpg';
import generatedArticle5 from '@/assets/generated-article-5.jpg';
import generatedArticle6 from '@/assets/generated-article-6.jpg';

interface Article {
  id: string;
  name: string;
  ai_thumbnail: string | null;
  thumbnail: string | null;
  modified_time: string | null;
  mime_type: string;
}

const getArticleThumbnail = (article: Article): string => {
  // First priority: AI-generated thumbnail
  if (article.ai_thumbnail) {
    return article.ai_thumbnail;
  }

  // Second priority: Google Drive thumbnail  
  if (article.thumbnail) {
    return article.thumbnail;
  }
  
  // Third priority: Fallback to generated images based on article name patterns
  const name = article.name.toLowerCase();
  
  if (name.includes('cargo') && (name.includes('delivery') || name.includes('bl'))) {
    return generatedArticle1;
  }
  if (name.includes('casino') || name.includes('iot') || name.includes('hack')) {
    return generatedArticle2;
  }
  if (name.includes('crypto') || name.includes('madras') || name.includes('judgment')) {
    return generatedArticle3;
  }
  if (name.includes('cybercrime') || name.includes('prevention') || name.includes('handbook')) {
    return generatedArticle4;
  }
  if (name.includes('data') && (name.includes('population') || name.includes('best') || name.includes('practice'))) {
    return generatedArticle5;
  }
  if (name.includes('dgft') || (name.includes('trade') && name.includes('finance') && name.includes('study'))) {
    return generatedArticle6;
  }
  
  // Default fallback - use first generated image
  return generatedArticle1;
};

const LatestArticles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestArticles();
  }, []);

  const fetchLatestArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('google_drive_articles')
        .select('id, name, ai_thumbnail, thumbnail_link, modified_time, mime_type')
        .order('modified_time', { ascending: false })
        .limit(6);

      if (error) throw error;
      // Map thumbnail_link to thumbnail property for consistency
      const articlesWithThumbnails = (data || []).map(article => ({
        ...article,
        thumbnail: article.thumbnail_link || null
      }));
      setArticles(articlesWithThumbnails);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-subtle relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CreativeLoader size="lg" text="Loading latest articles..." className="min-h-[400px]" />
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-subtle relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl animate-float-delayed" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
            <TrendingUp className="h-4 w-4 mr-2" />
            Featured Content
          </Badge>
          <h2 className="professional-heading text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Latest Articles
          </h2>
          <p className="banking-text text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our most recent insights, research, and industry knowledge
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article, index) => (
            <Card
              key={article.id}
              className="group overflow-hidden bg-card/50 backdrop-blur-xl border-border/60 hover:shadow-premium transition-all duration-500 hover:-translate-y-2 cursor-pointer animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/article/${article.id}`)}
            >
              {/* Article Image */}
              <div className="relative h-56 bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden">
                <img
                  src={getArticleThumbnail(article)}
                  alt={article.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-border/60 shadow-soft">
                    <FileText className="h-3 w-3 mr-1" />
                    Article
                  </Badge>
                </div>
              </div>

              {/* Article Content */}
              <CardContent className="p-6">
                <h3 className="banking-text text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
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
                            year: 'numeric',
                          })
                        : 'No date'}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300 group-hover:text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <Button
            size="lg"
            onClick={() => navigate('/articles')}
            className="bg-gradient-to-r from-primary to-accent hover:shadow-premium text-primary-foreground font-semibold px-10 py-6 text-lg rounded-xl transition-all duration-500 hover:-translate-y-1 hover:scale-105 group"
          >
            View All Articles
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestArticles;
