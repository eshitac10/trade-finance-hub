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
  RefreshCw, Download, Clock, Eye
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

interface AnalyticsData {
  dailyUsers: number;
  monthlyUsers: number;
  yearlyUsers: number;
  avgDailyTime: number;
  avgMonthlyTime: number;
  avgYearlyTime: number;
  topPages: Array<{ path: string; views: number }>;
}

const Statistics = () => {
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
    const weekAgo = subDays(now, 7);
    const monthAgo = subMonths(now, 1);
    const yearAgo = subYears(now, 1);

    try {
      const { data: weekData } = await supabase
        .from('forum_topics')
        .select('created_at')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at');

      const { data: monthData } = await supabase
        .from('forum_topics')
        .select('created_at')
        .gte('created_at', monthAgo.toISOString())
        .order('created_at');

      const { data: yearData } = await supabase
        .from('forum_topics')
        .select('created_at')
        .gte('created_at', yearAgo.toISOString())
        .order('created_at');

      const groupByDate = (data: any[], days: number) => {
        const counts: { [key: string]: number } = {};
        data?.forEach(item => {
          const date = format(new Date(item.created_at), 'yyyy-MM-dd');
          counts[date] = (counts[date] || 0) + 1;
        });

        const result: TimeSeriesData[] = [];
        for (let i = 0; i < days; i++) {
          const date = format(subDays(now, i), 'yyyy-MM-dd');
          result.unshift({ date, count: counts[date] || 0 });
        }
        return result;
      };

      setTimeSeriesData({
        week: groupByDate(weekData || [], 7),
        month: groupByDate(monthData || [], 30),
        year: groupByDate(yearData || [], 365)
      });
    } catch (error) {
      console.error('Error fetching time series data:', error);
    }
  };

  const fetchOldDataStats = async () => {
    const thirtyDaysAgo = subDays(new Date(), 30);

    try {
      const [
        { count: oldImports },
        { count: oldTopics },
        { count: oldArticles },
        { count: oldMemories }
      ] = await Promise.all([
        supabase.from('whatsapp_imports').select('*', { count: 'exact', head: true })
          .lt('updated_at', thirtyDaysAgo.toISOString()),
        supabase.from('forum_topics').select('*', { count: 'exact', head: true })
          .lt('updated_at', thirtyDaysAgo.toISOString()),
        supabase.from('user_articles').select('*', { count: 'exact', head: true })
          .lt('updated_at', thirtyDaysAgo.toISOString()),
        supabase.from('memories').select('*', { count: 'exact', head: true })
          .lt('updated_at', thirtyDaysAgo.toISOString())
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
    if (!oldDataStats || oldDataStats.totalSize === 0) return;

    const confirmed = confirm(
      `This will delete ${oldDataStats.totalSize} records that haven't been updated in 30+ days. Google Drive synced articles will be protected. Continue?`
    );

    if (!confirmed) return;

    setCleanupLoading(true);
    const thirtyDaysAgo = subDays(new Date(), 30);

    try {
      const results = await Promise.all([
        supabase.from('whatsapp_imports').delete()
          .lt('updated_at', thirtyDaysAgo.toISOString()),
        supabase.from('forum_topics').delete()
          .lt('updated_at', thirtyDaysAgo.toISOString()),
        supabase.from('user_articles').delete()
          .lt('updated_at', thirtyDaysAgo.toISOString()),
        supabase.from('memories').delete()
          .lt('updated_at', thirtyDaysAgo.toISOString())
      ]);

      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error('Some deletions failed');
      }

      toast({
        title: 'Cleanup Complete',
        description: `Successfully removed old data records`,
      });

      fetchStats();
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast({
        title: 'Cleanup Error',
        description: 'Failed to complete data cleanup',
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
        <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Statistics</h1>
              <p className="text-muted-foreground">Database insights and data usage</p>
            </div>
            <Button onClick={fetchStats} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="cleanup">Data Cleanup</TabsTrigger>
            </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Registered members</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Forum Activity</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.forumTopics.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{stats?.forumReplies.toLocaleString()} replies</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.events.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">WhatsApp Data</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.whatsappImports.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{stats?.whatsappMessages.toLocaleString()} messages</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Articles</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.userArticles.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{stats?.googleDriveArticles.toLocaleString()} from Drive</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memories</CardTitle>
                  <Image className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.memories.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Shared moments</p>
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
                      <div className="flex items-end gap-2 h-32">
                        {timeSeriesData.month.map((item, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div 
                              className="w-full bg-primary/20 hover:bg-primary/30 transition-colors rounded-t"
                              style={{ 
                                height: `${Math.max((item.count / Math.max(...timeSeriesData.month.map(d => d.count), 1)) * 100, 5)}%`
                              }}
                              title={`${item.count} topics` }
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
                      <h4 className="text-sm font-semibold mb-3">Last 12 Months</h4>
                      <div className="flex items-end gap-2 h-32">
                        {timeSeriesData.year.map((item, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div 
                              className="w-full bg-primary/20 hover:bg-primary/30 transition-colors rounded-t"
                              style={{ 
                                height: `${Math.max((item.count / Math.max(...timeSeriesData.year.map(d => d.count), 1)) * 100, 5)}%`
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
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cleanup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Data Cleanup
                </CardTitle>
                <CardDescription>
                  Remove data that hasn't been updated in 30+ days (Google Drive articles are protected)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {oldDataStats && oldDataStats.totalSize > 0 ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">WhatsApp Imports</span>
                          <Badge variant="secondary">{oldDataStats.whatsappImports}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Old imports to remove</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Forum Topics</span>
                          <Badge variant="secondary">{oldDataStats.forumTopics}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Inactive topics</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">User Articles</span>
                          <Badge variant="secondary">{oldDataStats.userArticles}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Old uploaded articles</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Memories</span>
                          <Badge variant="secondary">{oldDataStats.memories}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Old memory entries</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <div>
                          <p className="font-medium">Total Records to Clean</p>
                          <p className="text-sm text-muted-foreground">
                            {oldDataStats.totalSize} records haven't been updated in 30+ days
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={handleCleanup} 
                        variant="destructive"
                        disabled={cleanupLoading}
                      >
                        {cleanupLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Cleaning...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clean Up Data
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No old data to clean up</p>
                    <p className="text-sm">All your data is recent and active</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Statistics;
