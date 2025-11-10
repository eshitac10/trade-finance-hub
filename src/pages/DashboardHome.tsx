import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Plus,
  Clock,
  Users,
  Sparkles,
  Send,
  Calendar,
  FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  article_slug: string | null;
  category_id: string | null;
}

interface DashboardStats {
  totalArticles: number;
  totalEvents: number;
  totalMembers: number;
}

const DashboardHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ totalArticles: 0, totalEvents: 0, totalMembers: 0 });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
      setUser(session.user);
    };

    checkAuth();
    fetchTopics();
    fetchStats();

    const channel = supabase
      .channel("forum_topics_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_topics",
        },
        () => {
          fetchTopics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("forum_topics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: articlesCount } = await supabase
        .from("google_drive_articles")
        .select("*", { count: "exact", head: true });

      setStats({
        totalArticles: articlesCount || 0,
        totalEvents: 12,
        totalMembers: 1234,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("forum_topics").insert({
        title: newTopicTitle,
        content: newTopicContent,
        user_id: user.id,
        category_id: null,
        article_slug: null,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your topic has been created.",
      });

      setNewTopicTitle("");
      setNewTopicContent("");
      setNewTopicCategory("General");
      fetchTopics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create topic",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/5">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-justify">
          <h1 className="professional-heading text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="h-10 w-10 text-accent animate-pulse" />
            Dashboard
          </h1>
          <p className="banking-text text-lg text-muted-foreground">
            Welcome to your Trade Finance World community hub
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/90 backdrop-blur-xl border-border/60 hover:shadow-lg transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold text-foreground">{stats.totalArticles}</p>
                <p className="banking-text text-sm text-muted-foreground">Articles</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-xl border-border/60 hover:shadow-lg transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold text-foreground">{stats.totalEvents}</p>
                <p className="banking-text text-sm text-muted-foreground">Events</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-xl border-border/60 hover:shadow-lg transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="banking-text text-2xl font-bold text-foreground">{stats.totalMembers}</p>
                <p className="banking-text text-sm text-muted-foreground">Members</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forum Section */}
        <Card className="bg-card/90 backdrop-blur-xl border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="professional-heading text-2xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Community Discussions
              </h2>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    New Topic
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="professional-heading text-2xl">Create New Topic</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTopic} className="space-y-4">
                    <div>
                      <label className="banking-text text-sm font-medium mb-2 block">Title</label>
                      <Input
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        placeholder="Enter topic title..."
                        className="border-border/60"
                        required
                      />
                    </div>
                    <div>
                      <label className="banking-text text-sm font-medium mb-2 block">Category</label>
                      <select
                        value={newTopicCategory}
                        onChange={(e) => setNewTopicCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-border/60 bg-background text-foreground"
                      >
                        <option>General</option>
                        <option>Trade Finance</option>
                        <option>Banking</option>
                        <option>Compliance</option>
                        <option>Technology</option>
                      </select>
                    </div>
                    <div>
                      <label className="banking-text text-sm font-medium mb-2 block">Content</label>
                      <Textarea
                        value={newTopicContent}
                        onChange={(e) => setNewTopicContent(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="border-border/60 min-h-32"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Posting..." : "Post Topic"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Topics List */}
            <div className="space-y-4">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4 bg-background/50">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </Card>
                  ))}
                </>
              ) : topics.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="banking-text text-muted-foreground">No topics yet. Be the first to start a discussion!</p>
                </div>
              ) : (
                topics.map((topic) => (
                  <Card
                    key={topic.id}
                    className="p-6 bg-background/50 hover:bg-background/80 border-border/40 hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => navigate(`/forum/topic/${topic.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="banking-text text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(topic.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="professional-heading text-lg font-semibold mb-2 group-hover:text-primary transition-colors text-justify">
                          {topic.title}
                        </h3>
                        <p className="banking-text text-sm text-muted-foreground line-clamp-2 text-justify">
                          {topic.content}
                        </p>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {topic.user_id ? topic.user_id[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
