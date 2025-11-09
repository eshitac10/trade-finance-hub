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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Clock, Users, Plus, ArrowRight, MessageCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

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
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'trending'>('recent');

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

  // Fetch all topics
  const fetchTopics = async () => {
    const { data: topicsData, error } = await supabase
      .from('forum_topics')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });

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

    setTopics(topicsWithCounts);
  };

  useEffect(() => {
    fetchTopics();

    // Subscribe to realtime updates
    const topicsChannel = supabase
      .channel('forum-topics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_topics' }, () => {
        fetchTopics();
      })
      .subscribe();

    const repliesChannel = supabase
      .channel('forum-replies-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_replies' }, () => {
        fetchTopics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(topicsChannel);
      supabase.removeChannel(repliesChannel);
    };
  }, []);

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!userId) {
      toast({
        title: 'Not Authenticated',
        description: 'Please log in to create a post',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    // Get the first category (default)
    const { data: categories } = await supabase
      .from('forum_categories')
      .select('id')
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('forum_topics')
      .insert({
        title: newTopicTitle,
        content: newTopicContent,
        category_id: categories?.id,
        user_id: userId,
      })
      .select();

    setLoading(false);

    if (error) {
      console.error('Error creating topic:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create post',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Post created successfully',
    });

    setIsCreateDialogOpen(false);
    setNewTopicTitle('');
    setNewTopicContent('');
  };

  const navigateToTopic = (topicId: string) => {
    navigate(`/forum/topic/${topicId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayedTopics = sortBy === 'recent' 
    ? topics 
    : [...topics].sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="professional-heading text-4xl text-primary flex items-center gap-3">
                <MessageSquare className="h-10 w-10" />
                Forum
              </h1>
              <p className="text-muted-foreground">
                Connect and discuss with trade finance professionals
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-premium transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-primary">Create a Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">Title</Label>
                    <Input
                      id="title"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="What's on your mind?"
                      className="bg-background border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-foreground">Content</Label>
                    <Textarea
                      id="content"
                      value={newTopicContent}
                      onChange={(e) => setNewTopicContent(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={8}
                      className="bg-background border-input"
                    />
                  </div>
                  <Button
                    onClick={handleCreateTopic}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-premium transition-all duration-300"
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('recent')}
              className={sortBy === 'recent' ? 'bg-gradient-to-r from-primary to-accent' : ''}
            >
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </Button>
            <Button
              variant={sortBy === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('trending')}
              className={sortBy === 'trending' ? 'bg-gradient-to-r from-primary to-accent' : ''}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </Button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-3">
          {displayedTopics.length > 0 ? (
            displayedTopics.map((topic, index) => (
              <Card
                key={topic.id}
                onClick={() => navigateToTopic(topic.id)}
                className="overflow-hidden bg-card/90 backdrop-blur-sm border-border shadow-soft hover:shadow-elegant hover:border-primary/30 transition-all duration-300 cursor-pointer animate-fade-in group rounded-xl"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 min-w-[50px]">
                      <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-semibold">
                          {getInitials(topic.author_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-center gap-1 mt-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">{topic.replies_count || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-primary group-hover:text-accent transition-colors mb-2 flex items-center gap-2">
                        {topic.title}
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                        {topic.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          <span className="font-medium">{topic.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="overflow-hidden bg-card/90 backdrop-blur-sm border-border border-dashed animate-fade-in rounded-xl">
              <div className="px-8 py-16 text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">No posts yet</p>
                <p className="text-sm">Be the first to start a discussion!</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;