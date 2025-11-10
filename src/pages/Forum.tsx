import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Heart, AtSign, Send, FileText, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  category_id?: string;
  user_id: string;
  created_at: string;
  article_slug?: string;
  replies_count?: number;
  likes_count?: number;
  user_has_liked?: boolean;
  author_name?: string;
}

interface Article {
  id: string;
  name: string;
  file_id: string;
}

const Forum = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<ForumTopic | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);

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

  const fetchTopics = async () => {
    const { data: topicsData, error } = await supabase
      .from('forum_topics')
      .select('*')
      .is('article_slug', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching topics:', error);
      return;
    }

    // Batch fetch author profiles to avoid relationship requirement
    const userIds = Array.from(new Set((topicsData || []).map(t => t.user_id).filter(Boolean)));
    let profileMap: Record<string, { full_name: string | null; email: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds as string[]);
      profileMap = (profilesData || []).reduce((acc, p: any) => {
        acc[p.id] = { full_name: p.full_name, email: p.email };
        return acc;
      }, {} as Record<string, { full_name: string | null; email: string | null }>);
    }

    const topicsWithCounts = await Promise.all(
      (topicsData || []).map(async (topic) => {
        const { count: repliesCount } = await supabase
          .from('forum_replies')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id);

        const { count: likesCount } = await supabase
          .from('forum_topic_likes')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id);

        const { count: userLike } = await supabase
          .from('forum_topic_likes')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id)
          .eq('user_id', userId || '');

        const profile = profileMap[topic.user_id] || null;
        return {
          ...topic,
          replies_count: repliesCount || 0,
          likes_count: likesCount || 0,
          user_has_liked: (userLike || 0) > 0,
          author_name: (profile?.full_name || profile?.email) || 'Anonymous'
        };
      })
    );

    setTopics(topicsWithCounts);
  };

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('google_drive_articles')
      .select('id, name, file_id')
      .order('created_time', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching articles:', error);
      return;
    }
    setArticles(data || []);
  };

  useEffect(() => {
    if (userId) {
      fetchTopics();
      fetchArticles();
    }
  }, [userId]);

  useEffect(() => {
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

    const likesChannel = supabase
      .channel('forum-likes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_topic_likes' }, () => {
        fetchTopics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(topicsChannel);
      supabase.removeChannel(repliesChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [userId]);

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      toast({
        title: 'Empty Post',
        description: 'Please write something',
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

    const { error } = await supabase
      .from('forum_topics')
      .insert({
        title: newPost.substring(0, 100),
        content: newPost,
        user_id: userId,
      });

    setLoading(false);

    if (error) {
      console.error('Error creating post:', error);
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
    await fetchTopics();
    setNewPost('');
  };

  const handleLike = async (topicId: string, hasLiked: boolean) => {
    if (!userId) return;

    if (hasLiked) {
      await supabase
        .from('forum_topic_likes')
        .delete()
        .eq('topic_id', topicId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('forum_topic_likes')
        .insert({ topic_id: topicId, user_id: userId });
    }
  };

  const navigateToTopic = (topicId: string) => {
    navigate(`/forum/topic/${topicId}`);
  };

  const handleEdit = (topic: ForumTopic) => {
    setEditingTopic(topic);
    setEditContent(topic.content);
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim() || !editingTopic) return;

    const { error } = await supabase
      .from('forum_topics')
      .update({
        content: editContent,
        title: editContent.substring(0, 100),
      })
      .eq('id', editingTopic.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Post updated successfully',
    });
    setEditingTopic(null);
    setEditContent('');
    await fetchTopics();
  };

  const handleDelete = async () => {
    if (!deleteTopicId) return;

    const { error } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', deleteTopicId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Post deleted successfully',
    });
    setDeleteTopicId(null);
    await fetchTopics();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="professional-heading text-3xl sm:text-4xl text-primary mb-2">Forum</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Connect and discuss with trade finance professionals
          </p>
        </div>

        {/* Create Post Card */}
        <Card className="mb-6 overflow-hidden bg-card/90 backdrop-blur-sm border-border shadow-soft rounded-2xl">
          <div className="p-6">
            <div className="flex gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                  {userId ? 'ME' : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's up today?"
                  rows={3}
                  className="bg-background border-input resize-none focus:ring-2 focus:ring-primary transition-all"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleCreatePost}
                    disabled={loading || !newPost.trim()}
                    className="bg-gradient-to-r from-primary to-accent hover:shadow-premium transition-all duration-300"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Articles Discussion Section - Left Sidebar */}
          {articles.length > 0 && (
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="overflow-hidden bg-card/90 backdrop-blur-sm border-border shadow-professional hover:shadow-elegant transition-all rounded-2xl lg:sticky lg:top-6">
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 rounded-t-2xl">
                  <h2 className="professional-heading text-2xl sm:text-3xl flex items-center gap-2 sm:gap-3">
                    <FileText className="h-5 w-5 sm:h-7 sm:w-7" />
                    Discuss Articles
                  </h2>
                </div>
                <div className="p-6 sm:p-8 space-y-3 sm:space-y-4 max-h-[500px] sm:max-h-[700px] overflow-y-auto">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => navigate(`/article/${article.id}`)}
                      className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-background/50 hover:bg-background transition-all cursor-pointer group border border-border/40 hover:border-primary/40 hover:shadow-professional"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                        <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {article.name}
                        </span>
                      </div>
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-3" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Posts List - Takes remaining space */}
          <div className={`space-y-4 order-1 lg:order-2 ${articles.length > 0 ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
            <Card className="overflow-hidden bg-card/90 backdrop-blur-sm border-border shadow-professional rounded-2xl mb-4">
              <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-6 rounded-t-2xl">
                <h2 className="professional-heading text-3xl">Community Posts</h2>
              </div>
            </Card>
          {topics.length > 0 ? (
            topics.map((topic, index) => (
              <Card
                key={topic.id}
                className="overflow-hidden bg-card/90 backdrop-blur-sm border-border shadow-soft hover:shadow-elegant transition-all duration-300 animate-fade-in rounded-2xl"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                  <div className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                        {getInitials(topic.author_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-foreground">{topic.author_name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        {topic.user_id === userId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(topic)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                               <DropdownMenuItem 
                                onClick={() => setDeleteTopicId(topic.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      <p 
                        className="text-foreground mb-4 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigateToTopic(topic.id)}
                      >
                        {topic.content}
                      </p>

                      <div className="flex items-center gap-6 text-muted-foreground">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(topic.id, topic.user_has_liked || false);
                          }}
                          className={`flex items-center gap-2 hover:text-primary transition-colors ${
                            topic.user_has_liked ? 'text-primary' : ''
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${topic.user_has_liked ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">{topic.likes_count || 0}</span>
                        </button>

                        <button
                          onClick={() => navigateToTopic(topic.id)}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          <MessageSquare className="h-5 w-5" />
                          <span className="text-sm font-medium">{topic.replies_count || 0}</span>
                        </button>

                        <button className="flex items-center gap-2 hover:text-primary transition-colors">
                          <AtSign className="h-5 w-5" />
                          <span className="text-sm font-medium">Mention</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="overflow-hidden bg-card/90 backdrop-blur-sm border-border border-dashed animate-fade-in rounded-2xl">
              <div className="px-8 py-16 text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">No posts yet</p>
                <p className="text-sm">Be the first to start a discussion!</p>
              </div>
            </Card>
          )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTopicId} onOpenChange={() => setDeleteTopicId(null)}>
          <AlertDialogContent className="bg-card border-border shadow-premium rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl text-primary">Delete Post</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground">
                Are you sure you want to delete this post? This action cannot be undone and the post will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel className="bg-background hover:bg-muted border-border">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Post Dialog */}
        <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your post..."
                rows={4}
                className="bg-background border-input resize-none focus:ring-2 focus:ring-primary transition-all"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingTopic(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePost} disabled={!editContent.trim()}>
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Forum;