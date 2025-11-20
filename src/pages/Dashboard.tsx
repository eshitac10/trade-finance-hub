import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  TrendingUp, 
  MessageSquare,
  Bell,
  BarChart3,
  Activity,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Target,
  Award,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Check authentication with Supabase
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && mounted) {
        navigate('/auth');
        return;
      }
      
      if (session && mounted) {
        setUserEmail(session.user.email || '');
        setMounted(true);
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && mounted) {
        navigate('/auth');
      } else if (session && mounted) {
        setUserEmail(session.user.email || '');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Sample data
  const stats = [
    { label: 'Network Connections', value: '1,234', icon: Users, trend: '+12%', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', progress: 75 },
    { label: 'Articles Read', value: '89', icon: BookOpen, trend: '+23%', color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', progress: 60 },
    { label: 'Events Attended', value: '15', icon: Calendar, trend: '+5%', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', progress: 45 },
  ];

  const achievements = [
    { title: 'Top Contributor', icon: Award, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { title: 'Network Builder', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'Knowledge Seeker', icon: BookOpen, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: 'Event Champion', icon: Sparkles, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  ];

  const activities = [
    {
      id: 1,
      user: 'GaneshVishwanathan',
      action: 'posted an update',
      time: '2 months ago',
      content: 'Why Trade Finance is popular... Yes, the Criminal Community swear by the documents.. Step into the dark side of the visible hiding in plain sight.....',
      avatar: '/placeholder.svg',
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      action: 'shared an article',
      time: '1 week ago',
      content: 'New regulations in trade finance: A comprehensive guide for 2024',
      avatar: '/placeholder.svg',
      likes: 42,
      comments: 15
    },
    {
      id: 3,
      user: 'Michael Chen',
      action: 'joined an event',
      time: '3 days ago',
      content: 'Global Trade Finance Summit 2024',
      avatar: '/placeholder.svg',
      likes: 18,
      comments: 5
    },
  ];

  const recentArticles = [
    {
      title: 'Recent Recertification CDCS Courses and Events',
      date: 'April 3, 2022',
      author: 'its.priyo',
      category: 'Certification',
      readTime: '5 min'
    },
    {
      title: 'Users Guide to the eUCP',
      date: 'February 28, 2021',
      author: 'Admin',
      category: 'Guidelines',
      readTime: '8 min'
    },
    {
      title: 'Larger govt banks may acquire smaller peers',
      date: 'June 6, 2018',
      author: 'Trade Desk',
      category: 'News',
      readTime: '4 min'
    },
  ];

  const upcomingEvents = [
    {
      title: 'Trade Finance Masterclass',
      date: 'Nov 15, 2024',
      time: '10:00 AM EST',
      attendees: 234,
      category: 'Workshop'
    },
    {
      title: 'Digital Banking Summit',
      date: 'Nov 22, 2024',
      time: '2:00 PM EST',
      attendees: 567,
      category: 'Summit'
    },
    {
      title: 'Risk Management Workshop',
      date: 'Dec 1, 2024',
      time: '3:00 PM EST',
      attendees: 189,
      category: 'Workshop'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <Navbar />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="professional-heading text-4xl text-primary mb-2 flex items-center gap-3">
                <Sparkles className="h-10 w-10 text-accent animate-pulse" />
                Welcome Back! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                {userEmail}
              </p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-elegant text-primary-foreground shadow-lg hover:scale-105 transition-all duration-300">
              <Bell className="h-4 w-4 mr-2 animate-bounce" />
              Notifications
              <Badge className="ml-2 bg-red-500 text-white animate-pulse">3</Badge>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className={`relative p-6 bg-card/90 backdrop-blur-sm border-border hover:border-accent/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-scale-in group overflow-hidden ${mounted ? 'opacity-100' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      <stat.icon className="h-7 w-7 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold group-hover:scale-110 transition-transform bg-accent/10 text-accent border-accent/20">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-primary mb-1 group-hover:scale-105 transition-transform">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mb-3">{stat.label}</p>
                    <Progress value={stat.progress} className="h-1.5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Achievements Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {achievements.map((achievement, index) => (
              <Card key={index} className="p-4 bg-card/80 backdrop-blur-sm border-border hover:border-accent/50 transition-all duration-300 hover:scale-105 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${achievement.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <TabsList className="bg-card/80 backdrop-blur-sm border border-border mb-6 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300">
              <MessageSquare className="h-4 w-4 mr-2" />
              Activity Feed
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300">
              <BookOpen className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="p-6 bg-card/90 backdrop-blur-sm border-border hover:shadow-2xl transition-all duration-300 animate-slide-in-left">
                <h3 className="professional-heading text-xl text-primary mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-accent" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start hover:bg-gradient-to-r hover:from-accent/10 hover:to-primary/10 hover:border-accent transition-all group h-12">
                    <FileText className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform text-accent" />
                    Browse Articles
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-2 transition-transform" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-gradient-to-r hover:from-accent/10 hover:to-primary/10 hover:border-accent transition-all group h-12">
                    <Calendar className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform text-accent" />
                    Register for Events
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-2 transition-transform" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-gradient-to-r hover:from-accent/10 hover:to-primary/10 hover:border-accent transition-all group h-12">
                    <Users className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform text-accent" />
                    Expand Network
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-2 transition-transform" />
                  </Button>
                </div>
              </Card>

              {/* Performance Chart Placeholder */}
              <Card className="p-6 bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-border hover:shadow-2xl transition-all duration-300 animate-slide-in-right">
                <h3 className="professional-heading text-xl text-primary mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-accent" />
                  Your Activity Trends
                </h3>
                <div className="h-72 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-xl flex items-center justify-center border-2 border-dashed border-primary/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="text-center relative z-10">
                    <TrendingUp className="h-20 w-20 text-accent/30 mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground font-semibold">Activity chart visualization</p>
                    <p className="text-xs text-muted-foreground mt-2">Track your engagement over time</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Feed Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="p-6 bg-card/90 backdrop-blur-sm border-border hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="professional-heading text-xl text-primary flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-accent animate-pulse" />
                  Recent Activity
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="hover:bg-accent/10 hover:border-accent">All Members</Button>
                  <Button variant="outline" size="sm" className="hover:bg-accent/10 hover:border-accent">Mentions</Button>
                </div>
              </div>
              
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="flex gap-4 pb-6 border-b border-border last:border-0 animate-fade-in hover:bg-accent/5 p-4 rounded-xl transition-all duration-300 hover:shadow-lg group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Avatar className="h-14 w-14 border-3 border-primary/30 group-hover:border-accent/50 group-hover:scale-110 transition-all ring-2 ring-background">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">{activity.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-primary group-hover:text-accent transition-colors">{activity.user}</span>
                        <span className="text-muted-foreground text-sm">{activity.action}</span>
                        <span className="text-muted-foreground text-xs ml-auto">{activity.time}</span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">{activity.content}</p>
                      <div className="flex gap-6">
                        <Button variant="ghost" size="sm" className="text-xs hover:text-accent hover:bg-accent/10 h-8">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {activity.likes} Likes
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs hover:text-accent hover:bg-accent/10 h-8">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {activity.comments} Comments
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs hover:text-accent hover:bg-accent/10 h-8">
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-4">
            <Card className="p-6 bg-card/90 backdrop-blur-sm border-border hover:shadow-2xl transition-all duration-300">
              <h3 className="professional-heading text-xl text-primary mb-6 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-accent" />
                Library: Articles
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentArticles.map((article, index) => (
                  <Card 
                    key={index} 
                    className="p-5 bg-gradient-to-br from-accent/5 to-primary/5 border-border hover:border-accent/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer animate-scale-in group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{article.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-primary mb-3 group-hover:text-accent transition-colors line-clamp-2 min-h-[3rem]">
                      {article.title}
                    </h4>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {article.author}
                      </span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>
                    
                    <Button size="sm" variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all">
                      Read Article
                      <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card className="p-6 bg-card/90 backdrop-blur-sm border-border hover:shadow-2xl transition-all duration-300">
              <h3 className="professional-heading text-xl text-primary mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-accent" />
                Upcoming Events
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event, index) => (
                  <Card 
                    key={index} 
                    className="relative p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-border hover:border-accent/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer animate-scale-in group overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-primary/0 group-hover:from-accent/10 group-hover:to-primary/10 transition-all duration-500"></div>
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                          <Calendar className="h-7 w-7 text-white" />
                        </div>
                        <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                          {event.attendees} attending
                        </Badge>
                      </div>
                      
                      <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs">{event.category}</Badge>
                      
                      <h4 className="font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {event.date}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        {event.time}
                      </p>
                      
                      <Button size="sm" className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground group-hover:scale-105 transition-all">
                        <Sparkles className="h-3 w-3 mr-2" />
                        Register Now
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
