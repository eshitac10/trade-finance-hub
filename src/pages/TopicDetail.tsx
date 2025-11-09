import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, MessageSquare, Send, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name: string;
  author_email: string;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name: string;
  author_email: string;
}

const TopicDetail = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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

  const fetchTopic = async () => {
    if (!topicId) return;

    const { data, error } = await supabase
      .from('forum_topics')
      .select('*, profiles(full_name, email)')
      .eq('id', topicId)
      .single();

    if (error) {
      console.error('Error fetching topic:', error);
      return;
    }

    const profile = data.profiles as any;
    setTopic({
      ...data,
      author_name: profile?.full_name || profile?.email || 'Anonymous',
      author_email: profile?.email || ''
    });
  };

  const fetchReplies = async () => {
    if (!topicId) return;

    const { data, error } = await supabase
      .from('forum_replies')
      .select('*, profiles(full_name, email)')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching replies:', error);
      return;
    }

    const repliesWithAuthors = data.map(reply => {
      const profile = reply.profiles as any;
      return {
        ...reply,
        author_name: profile?.full_name || profile?.email || 'Anonymous',
        author_email: profile?.email || ''
      };
    });

    setReplies(repliesWithAuthors);
  };

  useEffect(() => {
    fetchTopic();
    fetchReplies();

    // Subscribe to realtime updates
    const repliesChannel = supabase
      .channel(`topic-${topicId}-replies`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'forum_replies', filter: `topic_id=eq.${topicId}` },
        () => {
          fetchReplies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(repliesChannel);
    };
  }, [topicId]);

  const handlePostReply = async () => {
    if (!newReply.trim()) {
      toast({
        title: 'Empty Reply',
        description: 'Please enter a reply',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('forum_replies')
      .insert({
        topic_id: topicId,
        content: newReply,
        user_id: userId,
      });

    setLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to post reply',
        variant: 'destructive',
      });
      return;
    }

    setNewReply('');
    toast({
      title: 'Success',
      description: 'Reply posted successfully',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/forum')}
          className="mb-6 hover:bg-accent/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Button>

        {/* Topic Card */}
        <Card className="mb-8 overflow-hidden bg-card/90 backdrop-blur-sm border-border shadow-elegant animate-fade-in rounded-2xl">
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-6">
            <h1 className="professional-heading text-3xl mb-3">{topic.title}</h1>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {topic.author_name}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          <div className="px-8 py-6">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{topic.content}</p>
          </div>
        </Card>

        {/* Replies Section */}
        <div className="space-y-4 mb-8">
          <h2 className="professional-heading text-2xl text-primary flex items-center gap-3">
            <MessageSquare className="h-6 w-6" />
            Replies ({replies.length})
          </h2>

          {replies.map((reply, index) => (
            <Card
              key={reply.id}
              className="overflow-hidden bg-card/90 backdrop-blur-sm border-border shadow-soft hover:shadow-professional transition-all duration-300 animate-fade-in rounded-xl"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="px-6 py-5">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                      {getInitials(reply.author_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-primary">{reply.author_name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {replies.length === 0 && (
            <Card className="overflow-hidden bg-card/90 backdrop-blur-sm border-border border-dashed animate-fade-in rounded-xl">
              <div className="px-8 py-12 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No replies yet. Be the first to reply!</p>
              </div>
            </Card>
          )}
        </div>

        {/* Reply Input */}
        <Card className="overflow-hidden bg-card/90 backdrop-blur-sm border-border shadow-elegant animate-scale-in rounded-2xl">
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-4">
            <h3 className="professional-heading text-lg">Post a Reply</h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            <Textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Share your thoughts..."
              rows={5}
              className="bg-background border-input resize-none focus:ring-2 focus:ring-primary transition-all"
            />
            <div className="flex justify-end">
              <Button
                onClick={handlePostReply}
                disabled={loading || !newReply.trim()}
                className="bg-gradient-to-r from-primary to-accent hover:shadow-premium transition-all duration-300 px-8"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Posting...' : 'Post Reply'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TopicDetail;