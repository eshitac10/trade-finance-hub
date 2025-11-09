import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, MessageCircle, Clock, TrendingUp, Users, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  topics_count?: number;
  replies_count?: number;
  last_activity?: {
    user_name: string;
    time: string;
  };
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  category_id: string;
  user_id: string;
  created_at: string;
  replies_count?: number;
  author_name?: string;
}

const Forum = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [recentTopics, setRecentTopics] = useState<ForumTopic[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Check authentication and get user
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setUserId(session.user.id);
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch categories with counts
  const fetchCategories = async () => {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('forum_categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return;
    }

    // Get counts for each category
    const categoriesWithCounts = await Promise.all(
      (categoriesData || []).map(async (category) => {
        const { count: topicsCount } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        const { data: topicsData } = await supabase
          .from('forum_topics')
          .select('id')
          .eq('category_id', category.id);

        let repliesCount = 0;
        if (topicsData && topicsData.length > 0) {
          const topicIds = topicsData.map(t => t.id);
          const { count } = await supabase
            .from('forum_replies')
            .select('*', { count: 'exact', head: true })
            .in('topic_id', topicIds);
          repliesCount = count || 0;
        }

        // Get last activity
        const { data: lastTopic } = await supabase
          .from('forum_topics')
          .select('created_at, profiles(full_name, email)')
          .eq('category_id', category.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        let last_activity;
        if (lastTopic) {
          const profile = lastTopic.profiles as any;
          last_activity = {
            user_name: profile?.full_name || profile?.email || 'Anonymous',
            time: formatDistanceToNow(new Date(lastTopic.created_at), { addSuffix: true })
          };
        }

        return {
          ...category,
          topics_count: topicsCount || 0,
          replies_count: repliesCount,
          last_activity
        };
      })
    );

    setCategories(categoriesWithCounts);
  };

  // Fetch recent topics
  const fetchRecentTopics = async () => {
    const { data: topicsData, error } = await supabase
      .from('forum_topics')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching topics:', error);
      return;
    }

    const topicsWithCounts = await Promise.all(
      (topicsData || []).map(async (topic) => {
        const { count } = await supabase
          .from('forum_replies')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id);

        const profile = topic.profiles as any;
        return {
          ...topic,
          replies_count: count || 0,
          author_name: profile?.full_name || profile?.email || 'Anonymous'
        };
      })
    );

    setRecentTopics(topicsWithCounts);
  };

  useEffect(() => {
    fetchCategories();
    fetchRecentTopics();

    // Subscribe to realtime updates
    const categoriesChannel = supabase
      .channel('forum-categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_categories' }, () => {
        fetchCategories();
      })
      .subscribe();

    const topicsChannel = supabase
      .channel('forum-topics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_topics' }, () => {
        fetchCategories();
        fetchRecentTopics();
      })
      .subscribe();

    const repliesChannel = supabase
      .channel('forum-replies-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_replies' }, () => {
        fetchCategories();
        fetchRecentTopics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(topicsChannel);
      supabase.removeChannel(repliesChannel);
    };
  }, []);

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !selectedCategory) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('forum_topics')
      .insert({
        title: newTopicTitle,
        content: newTopicContent,
        category_id: selectedCategory,
        user_id: userId,
      });

    setLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create topic',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Topic created successfully',
    });

    setIsCreateDialogOpen(false);
    setNewTopicTitle('');
    setNewTopicContent('');
    setSelectedCategory('');
  };

  const navigateToTopic = (topicId: string) => {
    navigate(`/forum/topic/${topicId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-up space-y-3">
          <h1 className="professional-heading text-5xl text-primary mb-3 flex items-center gap-4">
            <MessageSquare className="h-12 w-12" />
            Community Forum
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect, discuss, and share insights with trade finance professionals worldwide
          </p>
        </div>

        {/* Forum Categories */}
        <Card className="mb-10 overflow-hidden bg-card/90 backdrop-blur-sm border-border shadow-elegant hover:shadow-premium transition-all duration-500 animate-scale-in rounded-2xl">
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-5 flex justify-between items-center">
            <h2 className="professional-heading text-2xl">Discussion Categories</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="bg-background/20 hover:bg-background/30 border border-primary-foreground/20">
                  <Plus className="h-4 w-4 mr-2" />
                  New Topic
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-primary">Start a New Discussion</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-foreground">Category</Label>
                    <select
                      id="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">Topic Title</Label>
                    <Input
                      id="title"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="Enter an engaging title..."
                      className="bg-background border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-foreground">Description</Label>
                    <Textarea
                      id="content"
                      value={newTopicContent}
                      onChange={(e) => setNewTopicContent(e.target.value)}
                      placeholder="Describe your topic in detail..."
                      rows={6}
                      className="bg-background border-input"
                    />
                  </div>
                  <Button
                    onClick={handleCreateTopic}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-premium transition-all duration-300"
                  >
                    {loading ? 'Creating...' : 'Create Topic'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="divide-y divide-border">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="px-8 py-6 hover:bg-accent/5 transition-all duration-300 cursor-pointer animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <MessageCircle className="h-10 w-10 text-primary flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-primary group-hover:text-accent transition-colors mb-1">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-primary">{category.topics_count || 0}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Topics</div>
                    </div>
                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-accent">{category.replies_count || 0}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Replies</div>
                    </div>
                    <div className="min-w-[200px]">
                      {category.last_activity ? (
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="h-4 w-4" />
                            {category.last_activity.time}
                          </div>
                          <div className="text-xs text-muted-foreground">by {category.last_activity.user_name}</div>
                        </div>
                      ) : (
                        <div className="text-right text-sm text-muted-foreground italic">No activity yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Topics */}
        <Card className="overflow-hidden bg-card/90 backdrop-blur-sm border-border shadow-elegant hover:shadow-premium transition-all duration-500 animate-fade-in rounded-2xl" style={{ animationDelay: '0.3s' }}>
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-5">
            <h2 className="professional-heading text-2xl flex items-center gap-3">
              <TrendingUp className="h-6 w-6" />
              Recent Discussions
            </h2>
          </div>
          
          <div className="divide-y divide-border">
            {recentTopics.length > 0 ? (
              recentTopics.map((topic, index) => (
                <div
                  key={topic.id}
                  onClick={() => navigateToTopic(topic.id)}
                  className="px-8 py-5 hover:bg-accent/5 transition-all duration-300 cursor-pointer animate-fade-in group"
                  style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-primary group-hover:text-accent transition-colors mb-2 flex items-center gap-2">
                        {topic.title}
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {topic.author_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm">
                      {topic.replies_count || 0} {topic.replies_count === 1 ? 'reply' : 'replies'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-8 py-12 text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No discussions yet. Be the first to start one!</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Forum;