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
  Users, Trash2, AlertCircle, Activity, Clock, Eye, RefreshCw, Database
} from 'lucide-react';
import { subDays, format, startOfDay, endOfDay, subMonths, subYears } from 'date-fns';

interface UsageStats {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  yearlyActiveUsers: number;
  avgDailyTime: number;
  avgMonthlyTime: number;
  avgYearlyTime: number;
  topPages: Array<{ path: string; views: number }>;
}

interface OldDataStats {
  tables: Array<{
    name: string;
    count: number;
    displayName: string;
  }>;
  totalSize: number;
}

const Statistics = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [oldDataStats, setOldDataStats] = useState<OldDataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const dayAgo = subDays(now, 1);
      const monthAgo = subMonths(now, 1);
      const yearAgo = subYears(now, 1);

      // Fetch daily active users
      const { data: dailyUsers } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact' })
        .gte('timestamp', dayAgo.toISOString())
        .not('user_id', 'is', null);

      const dailyUniqueUsers = new Set(dailyUsers?.map(u => u.user_id)).size;

      // Fetch monthly active users
      const { data: monthlyUsers } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact' })
        .gte('timestamp', monthAgo.toISOString())
        .not('user_id', 'is', null);

      const monthlyUniqueUsers = new Set(monthlyUsers?.map(u => u.user_id)).size;

      // Fetch yearly active users
      const { data: yearlyUsers } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact' })
        .gte('timestamp', yearAgo.toISOString())
        .not('user_id', 'is', null);

      const yearlyUniqueUsers = new Set(yearlyUsers?.map(u => u.user_id)).size;

      // Calculate average time spent (daily)
      const { data: dailyDurations } = await supabase
        .from('analytics_events')
        .select('duration_seconds')
        .gte('timestamp', dayAgo.toISOString())
        .not('duration_seconds', 'is', null);

      const avgDailyTime = dailyDurations && dailyDurations.length > 0
        ? dailyDurations.reduce((sum, d) => sum + (d.duration_seconds || 0), 0) / dailyDurations.length
        : 0;

      // Calculate average time spent (monthly)
      const { data: monthlyDurations } = await supabase
        .from('analytics_events')
        .select('duration_seconds')
        .gte('timestamp', monthAgo.toISOString())
        .not('duration_seconds', 'is', null);

      const avgMonthlyTime = monthlyDurations && monthlyDurations.length > 0
        ? monthlyDurations.reduce((sum, d) => sum + (d.duration_seconds || 0), 0) / monthlyDurations.length
        : 0;

      // Calculate average time spent (yearly)
      const { data: yearlyDurations } = await supabase
        .from('analytics_events')
        .select('duration_seconds')
        .gte('timestamp', yearAgo.toISOString())
        .not('duration_seconds', 'is', null);

      const avgYearlyTime = yearlyDurations && yearlyDurations.length > 0
        ? yearlyDurations.reduce((sum, d) => sum + (d.duration_seconds || 0), 0) / yearlyDurations.length
        : 0;

      // Get top viewed pages
      const { data: pageViews } = await supabase
        .from('analytics_events')
        .select('page_path')
        .eq('event_type', 'page_view');

      const pageCounts: { [key: string]: number } = {};
      pageViews?.forEach(pv => {
        pageCounts[pv.page_path] = (pageCounts[pv.page_path] || 0) + 1;
      });

      const topPages = Object.entries(pageCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      setStats({
        dailyActiveUsers: dailyUniqueUsers,
        monthlyActiveUsers: monthlyUniqueUsers,
        yearlyActiveUsers: yearlyUniqueUsers,
        avgDailyTime,
        avgMonthlyTime,
        avgYearlyTime,
        topPages
      });

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


  const fetchOldDataStats = async () => {
    const thirtyDaysAgo = subDays(new Date(), 30);

    try {
      const tables = [
        { name: 'whatsapp_imports', displayName: 'WhatsApp Imports' },
        { name: 'whatsapp_messages', displayName: 'WhatsApp Messages' },
        { name: 'whatsapp_events', displayName: 'WhatsApp Events' },
        { name: 'forum_topics', displayName: 'Forum Topics' },
        { name: 'forum_replies', displayName: 'Forum Replies' },
        { name: 'user_articles', displayName: 'User Articles' },
        { name: 'memories', displayName: 'Memories' },
        { name: 'events', displayName: 'Events' },
        { name: 'documents', displayName: 'Documents' }
      ];

      const counts = await Promise.all(
        tables.map(async (table) => {
          const { count } = await supabase
            .from(table.name as any)
            .select('*', { count: 'exact', head: true })
            .lt('updated_at', thirtyDaysAgo.toISOString());
          
          return {
            name: table.name,
            displayName: table.displayName,
            count: count || 0
          };
        })
      );

      const filteredCounts = counts.filter(c => c.count > 0);
      const totalSize = filteredCounts.reduce((sum, c) => sum + c.count, 0);

      setOldDataStats({
        tables: filteredCounts,
        totalSize
      });
    } catch (error) {
      console.error('Error fetching old data stats:', error);
    }
  };

  const handleCleanup = async () => {
    if (!oldDataStats || oldDataStats.totalSize === 0) return;

    const tableList = oldDataStats.tables.map(t => `${t.displayName}: ${t.count}`).join('\n');
    const confirmed = confirm(
      `This will delete ${oldDataStats.totalSize} old records:\n\n${tableList}\n\nGoogle Drive articles are protected. Continue?`
    );

    if (!confirmed) return;

    setCleanupLoading(true);
    const thirtyDaysAgo = subDays(new Date(), 30);

    try {
      const deletions = oldDataStats.tables.map(table =>
        supabase.from(table.name as any).delete()
          .lt('updated_at', thirtyDaysAgo.toISOString())
      );

      const results = await Promise.all(deletions);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error('Some deletions failed');
      }

      toast({
        title: 'Cleanup Complete',
        description: `Removed ${oldDataStats.totalSize} old records`,
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-red-950/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-red-900 to-red-950 bg-clip-text text-transparent mb-2">
              Statistics
            </h1>
            <p className="text-muted-foreground">Real-time user analytics and data management</p>
          </div>
          <Button onClick={fetchStats} variant="outline" className="border-red-900/20 hover:bg-red-950/10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-red-950/10">
            <TabsTrigger value="usage" className="data-[state=active]:bg-red-900/20">
              User Analytics
            </TabsTrigger>
            <TabsTrigger value="cleanup" className="data-[state=active]:bg-red-900/20">
              Data Cleanup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-red-900/20 bg-gradient-to-br from-card to-red-950/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                  <Users className="h-4 w-4 text-red-900" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-950 dark:text-red-100">
                    {stats?.dailyActiveUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
                </CardContent>
              </Card>

              <Card className="border-red-900/20 bg-gradient-to-br from-card to-red-950/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-red-900" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-950 dark:text-red-100">
                    {stats?.monthlyActiveUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                </CardContent>
              </Card>

              <Card className="border-red-900/20 bg-gradient-to-br from-card to-red-950/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Yearly Active Users</CardTitle>
                  <Users className="h-4 w-4 text-red-900" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-950 dark:text-red-100">
                    {stats?.yearlyActiveUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last 365 days</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-red-900/20 bg-gradient-to-br from-card to-red-950/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Daily Time</CardTitle>
                  <Clock className="h-4 w-4 text-red-900" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-950 dark:text-red-100">
                    {formatTime(stats?.avgDailyTime || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per user session</p>
                </CardContent>
              </Card>

              <Card className="border-red-900/20 bg-gradient-to-br from-card to-red-950/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Monthly Time</CardTitle>
                  <Clock className="h-4 w-4 text-red-900" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-950 dark:text-red-100">
                    {formatTime(stats?.avgMonthlyTime || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per user session</p>
                </CardContent>
              </Card>

              <Card className="border-red-900/20 bg-gradient-to-br from-card to-red-950/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Yearly Time</CardTitle>
                  <Clock className="h-4 w-4 text-red-900" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-950 dark:text-red-100">
                    {formatTime(stats?.avgYearlyTime || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per user session</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-red-900/20 bg-gradient-to-br from-card to-red-950/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-red-900" />
                  Most Viewed Pages
                </CardTitle>
                <CardDescription>Top 10 pages by view count</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.topPages && stats.topPages.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topPages.map((page, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-red-950/5 border border-red-900/10">
                        <span className="font-medium text-sm">{page.path}</span>
                        <Badge variant="secondary" className="bg-red-900/20 text-red-950 dark:text-red-100">
                          {page.views.toLocaleString()} views
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No page view data yet</p>
                    <p className="text-sm">Analytics will appear as users browse</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cleanup" className="space-y-6">
            <Card className="border-red-900/20 bg-gradient-to-br from-card to-red-950/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-900" />
                  Data Cleanup
                </CardTitle>
                <CardDescription>
                  Remove data not updated in 30+ days (Google Drive articles are protected)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {oldDataStats && oldDataStats.totalSize > 0 ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {oldDataStats.tables.map((table, idx) => (
                        <div key={idx} className="p-4 border border-red-900/20 rounded-lg bg-red-950/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{table.displayName}</span>
                            <Badge variant="secondary" className="bg-red-900/20 text-red-950 dark:text-red-100">
                              {table.count}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Records to remove</p>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-red-900/20" />

                    <div className="flex items-center justify-between p-4 bg-red-900/10 border border-red-900/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-900" />
                        <div>
                          <p className="font-medium text-red-950 dark:text-red-100">Total Records to Clean</p>
                          <p className="text-sm text-muted-foreground">
                            {oldDataStats.totalSize} records haven't been updated in 30+ days
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={handleCleanup} 
                        variant="destructive"
                        disabled={cleanupLoading}
                        className="bg-red-900 hover:bg-red-950"
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
