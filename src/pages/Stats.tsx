import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, TrendingUp, Users, MessageSquare, Calendar, 
  FileText, Image, Trash2, AlertCircle, Activity, BarChart3,
  RefreshCw, Download
} from 'lucide-react';
import { formatDistanceToNow, subDays, subMonths, subYears, format } from 'date-fns';

interface UsageStats {
  totalUsers: number;
  forumTopics: number;
  forumReplies: number;
  whatsappImports: number;
  whatsappMessages: number;
  events: number;
  userArticles: number;
  memories: number;
  googleDriveArticles: number;
}

interface TimeSeriesData {
  date: string;
  count: number;
}

interface OldDataStats {
  whatsappImports: number;
  forumTopics: number;
  userArticles: number;
  memories: number;
  totalSize: number;
}

const Stats = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [oldDataStats, setOldDataStats] = useState<OldDataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [timeSeriesData, setTimeSeriesData] = useState<{
    week: TimeSeriesData[];
    month: TimeSeriesData[];
    year: TimeSeriesData[];
  } | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all counts in parallel
      const [
        { count: users },
        { count: topics },
        { count: replies },
        { count: imports },
        { count: messages },
        { count: events },
        { count: articles },
        { count: memories },
        { count: gdArticles }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('forum_topics').select('*', { count: 'exact', head: true }),
        supabase.from('forum_replies').select('*', { count: 'exact', head: true }),
        supabase.from('whatsapp_imports').select('*', { count: 'exact', head: true }),
        supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('user_articles').select('*', { count: 'exact', head: true }),
        supabase.from('memories').select('*', { count: 'exact', head: true }),
        supabase.from('google_drive_articles').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: users || 0,
        forumTopics: topics || 0,
        forumReplies: replies || 0,
        whatsappImports: imports || 0,
        whatsappMessages: messages || 0,
        events: events || 0,
        userArticles: articles || 0,
        memories: memories || 0,
        googleDriveArticles: gdArticles || 0
      });

      // Fetch time series data
      await fetchTimeSeriesData();
      await fetchOldDataStats();
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load statistics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSeriesData = async () => {
    const now = new Date();
    
    // Get forum topics created over time
    const weekAgo = subDays(now, 7);
    const monthAgo = subMonths(now, 1);
    const yearAgo = subYears(now, 1);

    try {
      const { data: weekData } = await supabase
        .from('forum_topics')
        .select('created_at')
        .gte('created_at', weekAgo.toISOString());

      const { data: monthData } = await supabase
        .from('forum_topics')
        .select('created_at')
        .gte('created_at', monthAgo.toISOString());

      const { data: yearData } = await supabase
        .from('forum_topics')
        .select('created_at')
        .gte('created_at', yearAgo.toISOString());

      setTimeSeriesData({
        week: processTimeSeriesData(weekData || [], 7, 'day'),
        month: processTimeSeriesData(monthData || [], 30, 'day'),
        year: processTimeSeriesData(yearData || [], 12, 'month')
      });
    } catch (error) {
      console.error('Error fetching time series data:', error);
    }
  };

  const processTimeSeriesData = (data: any[], periods: number, type: 'day' | 'month'): TimeSeriesData[] => {
    const result: TimeSeriesData[] = [];
    const now = new Date();

    for (let i = periods - 1; i >= 0; i--) {
      const date = type === 'day' ? subDays(now, i) : subMonths(now, i);
      const dateStr = format(date, type === 'day' ? 'MMM dd' : 'MMM yyyy');
      
      const count = data.filter(item => {
        const itemDate = new Date(item.created_at);
        if (type === 'day') {
          return itemDate.toDateString() === date.toDateString();
        } else {
          return itemDate.getMonth() === date.getMonth() && 
                 itemDate.getFullYear() === date.getFullYear();
        }
      }).length;

      result.push({ date: dateStr, count });
    }

    return result;
  };

  const fetchOldDataStats = async () => {
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

    try {
      const [
        { count: oldImports },
        { count: oldTopics },
        { count: oldArticles },
        { count: oldMemories }
      ] = await Promise.all([
        supabase.from('whatsapp_imports').select('*', { count: 'exact', head: true }).lt('updated_at', thirtyDaysAgo),
        supabase.from('forum_topics').select('*', { count: 'exact', head: true }).lt('updated_at', thirtyDaysAgo),
        supabase.from('user_articles').select('*', { count: 'exact', head: true }).lt('updated_at', thirtyDaysAgo),
        supabase.from('memories').select('*', { count: 'exact', head: true }).lt('updated_at', thirtyDaysAgo)
      ]);

      setOldDataStats({
        whatsappImports: oldImports || 0,
        forumTopics: oldTopics || 0,
        userArticles: oldArticles || 0,
        memories: oldMemories || 0,
        totalSize: (oldImports || 0) + (oldTopics || 0) + (oldArticles || 0) + (oldMemories || 0)
      });
    } catch (error) {
      console.error('Error fetching old data stats:', error);
    }
  };

  const handleCleanup = async () => {
    if (!oldDataStats || oldDataStats.totalSize === 0) {
      toast({
        title: 'No data to clean',
        description: 'There is no data older than 30 days to remove'
      });
      return;
    }

    if (!confirm(`This will permanently delete ${oldDataStats.totalSize} items that haven't been updated in 30+ days. Google Drive synced articles will be preserved. Continue?`)) {
      return;
    }

    setCleanupLoading(true);
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      // Delete old data (excluding google_drive_articles)
      const deletePromises = [];

      if (oldDataStats.whatsappImports > 0) {
        // Get old import IDs
        const { data: oldImports } = await supabase
          .from('whatsapp_imports')
          .select('id')
          .lt('updated_at', thirtyDaysAgo);

        if (oldImports && oldImports.length > 0) {
          const importIds = oldImports.map(i => i.id);
          deletePromises.push(
            supabase.from('whatsapp_messages').delete().in('import_id', importIds),
            supabase.from('whatsapp_events').delete().in('import_id', importIds),
            supabase.from('whatsapp_imports').delete().in('id', importIds)
          );
        }
      }

      if (oldDataStats.forumTopics > 0) {
        deletePromises.push(
          supabase.from('forum_topics').delete().lt('updated_at', thirtyDaysAgo)
        );
      }

      if (oldDataStats.userArticles > 0) {
        deletePromises.push(
          supabase.from('user_articles').delete().lt('updated_at', thirtyDaysAgo)
        );
      }

      if (oldDataStats.memories > 0) {
        deletePromises.push(
          supabase.from('memories').delete().lt('updated_at', thirtyDaysAgo)
        );
      }

      await Promise.all(deletePromises);

      toast({
        title: 'Cleanup complete',
        description: `Successfully removed ${oldDataStats.totalSize} old items`
      });

      // Refresh stats
      await fetchStats();
    } catch (error: any) {
      console.error('Cleanup error:', error);
      toast({
        title: 'Cleanup failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[500px]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="professional-heading text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Website Statistics
          </h1>
          <p className="text-lg text-muted-foreground">
            Real-time database usage and storage metrics
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 hover:shadow-premium transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-premium transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Forum Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{(stats?.forumTopics || 0) + (stats?.forumReplies || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.forumTopics} topics, {stats?.forumReplies} replies
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-premium transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                WhatsApp Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.whatsappMessages || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.whatsappImports} imports processed
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-premium transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" />
                Total Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {(stats?.events || 0) + (stats?.userArticles || 0) + (stats?.memories || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Events, articles & memories
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="cleanup">Cleanup</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Content Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Events</span>
                    <Badge variant="secondary">{stats?.events || 0}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">User Articles</span>
                    <Badge variant="secondary">{stats?.userArticles || 0}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Google Drive Articles</span>
                    <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                      {stats?.googleDriveArticles || 0}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Memories</span>
                    <Badge variant="secondary">{stats?.memories || 0}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Forum Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Topics</span>
                    <Badge variant="secondary">{stats?.forumTopics || 0}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Replies</span>
                    <Badge variant="secondary">{stats?.forumReplies || 0}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Replies per Topic</span>
                    <Badge variant="secondary">
                      {stats?.forumTopics ? Math.round((stats.forumReplies / stats.forumTopics) * 10) / 10 : 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Forum Activity Trends
                </CardTitle>
                <CardDescription>Number of topics created over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {timeSeriesData && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Last 7 Days</h4>
                      <div className="flex items-end gap-2 h-32">
                        {timeSeriesData.week.map((item, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div 
                              className="w-full bg-primary/20 hover:bg-primary/30 transition-colors rounded-t"
                              style={{ 
                                height: `${Math.max((item.count / Math.max(...timeSeriesData.week.map(d => d.count), 1)) * 100, 5)}%`
                              }}
                              title={`${item.count} topics`}
                            />
                            <span className="text-xs text-muted-foreground transform -rotate-45 origin-top-left whitespace-nowrap">
                              {item.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-semibold mb-3">Last 30 Days</h4>
                      <div className="flex items-end gap-1 h-32">
                        {timeSeriesData.month.slice(0, 15).map((item, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div 
                              className="w-full bg-accent/20 hover:bg-accent/30 transition-colors rounded-t"
                              style={{ 
                                height: `${Math.max((item.count / Math.max(...timeSeriesData.month.map(d => d.count), 1)) * 100, 5)}%`
                              }}
                              title={`${item.date}: ${item.count} topics`}
                            />
                            {idx % 3 === 0 && (
                              <span className="text-xs text-muted-foreground">{item.date.split(' ')[1]}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-semibold mb-3">Last 12 Months</h4>
                      <div className="flex items-end gap-2 h-32">
                        {timeSeriesData.year.map((item, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div 
                              className="w-full bg-gold/20 hover:bg-gold/30 transition-colors rounded-t"
                              style={{ 
                                height: `${Math.max((item.count / Math.max(...timeSeriesData.year.map(d => d.count), 1)) * 100, 5)}%`
                              }}
                              title={`${item.date}: ${item.count} topics`}
                            />
                            <span className="text-xs text-muted-foreground transform -rotate-45 origin-top-left whitespace-nowrap">
                              {item.date.split(' ')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cleanup" className="space-y-6">
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Data Cleanup (30+ Days Old)
                </CardTitle>
                <CardDescription>
                  Remove data that hasn't been updated in 30+ days. Google Drive synced articles are always preserved.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {oldDataStats && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">WhatsApp Imports</span>
                          <Badge variant={oldDataStats.whatsappImports > 0 ? "destructive" : "secondary"}>
                            {oldDataStats.whatsappImports}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Includes related messages and events
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Forum Topics</span>
                          <Badge variant={oldDataStats.forumTopics > 0 ? "destructive" : "secondary"}>
                            {oldDataStats.forumTopics}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Old discussion threads
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">User Articles</span>
                          <Badge variant={oldDataStats.userArticles > 0 ? "destructive" : "secondary"}>
                            {oldDataStats.userArticles}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          User-uploaded articles only
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Memories</span>
                          <Badge variant={oldDataStats.memories > 0 ? "destructive" : "secondary"}>
                            {oldDataStats.memories}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Old photos and videos
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between p-6 bg-destructive/5 rounded-lg border-2 border-destructive/20">
                      <div>
                        <h4 className="font-semibold text-lg mb-1">Total Items to Clean</h4>
                        <p className="text-sm text-muted-foreground">
                          {oldDataStats.totalSize > 0 
                            ? `${oldDataStats.totalSize} items are candidates for deletion`
                            : 'No old data to clean'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-destructive">
                          {oldDataStats.totalSize}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleCleanup}
                        disabled={cleanupLoading || !oldDataStats.totalSize}
                        variant="destructive"
                        className="flex-1"
                      >
                        {cleanupLoading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Cleaning...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Old Data
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={fetchStats}
                        variant="outline"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium text-foreground mb-1">Protected Content:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Google Drive synced articles (always preserved)</li>
                            <li>User profiles and authentication data</li>
                            <li>Recent data (updated within 30 days)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Stats;
