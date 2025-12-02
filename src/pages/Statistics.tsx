import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, Eye, Clock, TrendingUp, Calendar, User } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserStats {
  userId: string;
  userName: string;
  email: string;
  loginCount: number;
  totalTime: number;
  avgTimePerSession: number;
}

const Statistics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    totalSessions: 0,
    avgDuration: 0,
    dailyData: [] as any[],
    weeklyData: [] as any[],
    monthlyData: [] as any[],
    pageViews: [] as any[]
  });
  const [userStats, setUserStats] = useState<{
    today: UserStats[];
    week: UserStats[];
    month: UserStats[];
    year: UserStats[];
  }>({
    today: [],
    week: [],
    month: [],
    year: []
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      await fetchStatistics();
    };
    checkAuth();
  }, [navigate]);

  const fetchStatistics = async () => {
    try {
      const now = new Date();
      
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
      
      const weekDate = new Date(now);
      weekDate.setDate(weekDate.getDate() - 7);
      const weekStart = weekDate.toISOString();
      
      const monthDate = new Date(now);
      monthDate.setDate(monthDate.getDate() - 30);
      const monthStart = monthDate.toISOString();
      
      const yearDate = new Date(now);
      yearDate.setFullYear(yearDate.getFullYear() - 1);
      const yearStart = yearDate.toISOString();

      // Fetch all events and profiles in parallel
      const [eventsResult, profilesResult] = await Promise.all([
        supabase
          .from('analytics_events')
          .select('*')
          .order('timestamp', { ascending: true }),
        supabase
          .from('profiles')
          .select('id, full_name, email')
      ]);

      if (eventsResult.error) throw eventsResult.error;
      
      const allEvents = eventsResult.data || [];
      const profiles = profilesResult.data || [];
      
      // Create profile lookup map
      const profileMap = new Map(profiles.map(p => [p.id, p]));

      // Calculate unique sessions
      const uniqueSessions = new Set(allEvents.map(e => e.session_id));
      const totalSessions = uniqueSessions.size;

      // Calculate average duration
      const durations = allEvents.filter(e => e.duration_seconds).map(e => e.duration_seconds);
      const avgDuration = durations.length > 0 
        ? Math.round(durations.reduce((a, b) => a + (b || 0), 0) / durations.length)
        : 0;

      // Helper function to calculate user stats for a time period
      const calculateUserStats = (events: typeof allEvents): UserStats[] => {
        const userMap = new Map<string, { 
          sessions: Set<string>; 
          totalTime: number; 
          userName: string; 
          email: string;
        }>();

        events.forEach(event => {
          if (event.user_id) {
            const existing = userMap.get(event.user_id);
            const profile = profileMap.get(event.user_id);
            
            if (existing) {
              existing.sessions.add(event.session_id);
              if (event.duration_seconds) {
                existing.totalTime += event.duration_seconds;
              }
            } else {
              userMap.set(event.user_id, {
                sessions: new Set([event.session_id]),
                totalTime: event.duration_seconds || 0,
                userName: profile?.full_name || 'Unknown User',
                email: profile?.email || 'N/A'
              });
            }
          }
        });

        return Array.from(userMap.entries()).map(([userId, data]) => ({
          userId,
          userName: data.userName,
          email: data.email,
          loginCount: data.sessions.size,
          totalTime: data.totalTime,
          avgTimePerSession: data.sessions.size > 0 ? Math.round(data.totalTime / data.sessions.size) : 0
        })).sort((a, b) => b.loginCount - a.loginCount);
      };

      // Filter events by time period
      const todayEvents = allEvents.filter(e => e.timestamp >= todayStart);
      const weekEvents = allEvents.filter(e => e.timestamp >= weekStart);
      const monthEvents = allEvents.filter(e => e.timestamp >= monthStart);
      const yearEvents = allEvents.filter(e => e.timestamp >= yearStart);

      // Calculate user stats for each period
      const todayUserStats = calculateUserStats(todayEvents);
      const weekUserStats = calculateUserStats(weekEvents);
      const monthUserStats = calculateUserStats(monthEvents);
      const yearUserStats = calculateUserStats(yearEvents);

      setUserStats({
        today: todayUserStats,
        week: weekUserStats,
        month: monthUserStats,
        year: yearUserStats
      });

      // Today's unique sessions
      const todaySessions = new Set(todayEvents.map(e => e.session_id));
      const weekSessions = new Set(weekEvents.map(e => e.session_id));
      const monthSessions = new Set(monthEvents.map(e => e.session_id));
      const yearSessions = new Set(yearEvents.map(e => e.session_id));

      // Daily data for last 7 days
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();
        
        const daySessions = new Set(
          allEvents.filter(e => e.timestamp >= dayStart && e.timestamp <= dayEnd).map(e => e.session_id)
        );
        
        dailyData.push({
          date: new Date(dayStart).toLocaleDateString('en-US', { weekday: 'short' }),
          users: daySessions.size
        });
      }

      // Weekly data for last 4 weeks
      const weeklyData = [];
      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const weekStartDate = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const weekEndDate = new Date(date.setDate(date.getDate() + 6)).toISOString();
        
        const weekSessionsData = new Set(
          allEvents.filter(e => e.timestamp >= weekStartDate && e.timestamp <= weekEndDate).map(e => e.session_id)
        );
        
        weeklyData.push({
          week: `Week ${4 - i}`,
          users: weekSessionsData.size
        });
      }

      // Monthly data for last 6 months
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStartDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const monthEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();
        
        const monthSessionsData = new Set(
          allEvents.filter(e => e.timestamp >= monthStartDate && e.timestamp <= monthEndDate).map(e => e.session_id)
        );
        
        monthlyData.push({
          month: new Date(monthStartDate).toLocaleDateString('en-US', { month: 'short' }),
          users: monthSessionsData.size
        });
      }

      // Page views by path
      const pageViewsMap = new Map();
      allEvents.forEach(event => {
        const path = event.page_path;
        pageViewsMap.set(path, (pageViewsMap.get(path) || 0) + 1);
      });
      
      const pageViews = Array.from(pageViewsMap.entries())
        .map(([page, views]) => ({ page: page.split('/').pop() || 'home', views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      setStats({
        today: todaySessions.size,
        week: weekSessions.size,
        month: monthSessions.size,
        year: yearSessions.size,
        totalSessions,
        avgDuration,
        dailyData,
        weeklyData,
        monthlyData,
        pageViews
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const UserStatsTable = ({ data, period }: { data: UserStats[]; period: string }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Sessions</TableHead>
            <TableHead className="text-center">Total Time</TableHead>
            <TableHead className="text-center">Avg/Session</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No user activity for this period
              </TableCell>
            </TableRow>
          ) : (
            data.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {user.userName}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                    {user.loginCount}
                  </span>
                </TableCell>
                <TableCell className="text-center">{formatTime(user.totalTime)}</TableCell>
                <TableCell className="text-center">{formatTime(user.avgTimePerSession)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Activity className="h-10 w-10 text-primary" />
            Usage Statistics
          </h1>
          <p className="text-muted-foreground text-lg">Real-time insights into platform activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <AnimatedCounter end={stats.today} className="text-3xl font-bold text-foreground" />
                <Users className="h-8 w-8 text-primary/50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Active sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <AnimatedCounter end={stats.week} className="text-3xl font-bold text-foreground" />
                <Users className="h-8 w-8 text-accent/50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Active sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-chart-2/5 border-chart-2/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <AnimatedCounter end={stats.month} className="text-3xl font-bold text-foreground" />
                <Users className="h-8 w-8 text-chart-2/50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Active sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-chart-3/5 border-chart-3/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                This Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <AnimatedCounter end={stats.year} className="text-3xl font-bold text-foreground" />
                <Users className="h-8 w-8 text-chart-3/50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Active sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedCounter end={stats.totalSessions} className="text-5xl font-bold text-foreground" />
              <p className="text-sm text-muted-foreground mt-2">All-time platform sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Avg. Session Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter end={stats.avgDuration} className="text-5xl font-bold text-foreground" />
                <span className="text-2xl text-muted-foreground">sec</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Average time spent per session</p>
            </CardContent>
          </Card>
        </div>

        {/* User Activity Details */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Activity Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="today">Today ({userStats.today.length})</TabsTrigger>
                <TabsTrigger value="week">This Week ({userStats.week.length})</TabsTrigger>
                <TabsTrigger value="month">This Month ({userStats.month.length})</TabsTrigger>
                <TabsTrigger value="year">This Year ({userStats.year.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="today">
                <UserStatsTable data={userStats.today} period="today" />
              </TabsContent>
              <TabsContent value="week">
                <UserStatsTable data={userStats.week} period="week" />
              </TabsContent>
              <TabsContent value="month">
                <UserStatsTable data={userStats.month} period="month" />
              </TabsContent>
              <TabsContent value="year">
                <UserStatsTable data={userStats.year} period="year" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Daily Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Weekly Trends (Last 4 Weeks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="users" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-chart-2" />
                Monthly Overview (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="users" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-chart-3" />
                Top 5 Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.pageViews}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ page, percent }) => `${page} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="views"
                  >
                    {stats.pageViews.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
