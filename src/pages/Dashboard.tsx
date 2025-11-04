import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  TrendingUp, 
  MessageSquare,
  Bell,
  Search,
  BarChart3,
  Activity,
  Briefcase,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const userEmail = localStorage.getItem('userEmail') || 'admin@tfworld.com';

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  // Sample data
  const stats = [
    { label: 'Network Connections', value: '1,234', icon: Users, trend: '+12%', color: 'text-blue-500' },
    { label: 'Articles Read', value: '89', icon: BookOpen, trend: '+23%', color: 'text-green-500' },
    { label: 'Events Attended', value: '15', icon: Calendar, trend: '+5%', color: 'text-purple-500' },
    { label: 'Certifications', value: '3', icon: GraduationCap, trend: 'New!', color: 'text-orange-500' },
  ];

  const activities = [
    {
      id: 1,
      user: 'GaneshVishwanathan',
      action: 'posted an update',
      time: '2 months ago',
      content: 'Why Trade Finance is popular... Yes, the Criminal Community swear by the documents.. Step into the dark side of the visible hiding in plain sight.....',
      avatar: '/placeholder.svg'
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      action: 'shared an article',
      time: '1 week ago',
      content: 'New regulations in trade finance: A comprehensive guide for 2024',
      avatar: '/placeholder.svg'
    },
    {
      id: 3,
      user: 'Michael Chen',
      action: 'joined an event',
      time: '3 days ago',
      content: 'Global Trade Finance Summit 2024',
      avatar: '/placeholder.svg'
    },
  ];

  const recentArticles = [
    {
      title: 'Recent Recertification CDCS Courses and Events',
      date: 'April 3, 2022',
      author: 'its.priyo'
    },
    {
      title: 'Users Guide to the eUCP',
      date: 'February 28, 2021',
      author: 'Admin'
    },
    {
      title: 'Larger govt banks may acquire smaller peers',
      date: 'June 6, 2018',
      author: 'Trade Desk'
    },
  ];

  const upcomingEvents = [
    {
      title: 'Trade Finance Masterclass',
      date: 'Nov 15, 2024',
      attendees: 234
    },
    {
      title: 'Digital Banking Summit',
      date: 'Nov 22, 2024',
      attendees: 567
    },
    {
      title: 'Risk Management Workshop',
      date: 'Dec 1, 2024',
      attendees: 189
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="professional-heading text-4xl text-primary mb-2">
                Welcome Back! 👋
              </h1>
              <p className="text-muted-foreground">
                {userEmail}
              </p>
            </div>
            <Button className="bg-accent hover:bg-accent-hover text-accent-foreground shadow-elegant">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              <Badge className="ml-2 bg-red-500 text-white">3</Badge>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-elegant hover:border-accent/50 transition-all duration-500 hover:-translate-y-1 animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs group-hover:scale-110 transition-transform">
                    {stat.trend}
                  </Badge>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-1 group-hover:scale-105 transition-transform">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <TabsList className="bg-card border border-border mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-4 w-4 mr-2" />
              Activity Feed
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                <h3 className="professional-heading text-xl text-primary mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start hover:bg-accent/10 hover:border-accent transition-all group">
                    <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Browse Articles
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-accent/10 hover:border-accent transition-all group">
                    <Calendar className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Register for Events
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-accent/10 hover:border-accent transition-all group">
                    <Users className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Expand Network
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-accent/10 hover:border-accent transition-all group">
                    <GraduationCap className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Get Certified
                    <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>

              {/* Performance Chart Placeholder */}
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
                <h3 className="professional-heading text-xl text-primary mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Your Activity
                </h3>
                <div className="h-64 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg flex items-center justify-center border border-border/50">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-primary/30 mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground">Activity chart visualization</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Feed Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="professional-heading text-xl text-primary flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">All Members</Button>
                  <Button variant="outline" size="sm">Mentions</Button>
                </div>
              </div>
              
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="flex gap-4 pb-6 border-b border-border last:border-0 animate-fade-in hover:bg-accent/5 p-4 rounded-lg transition-all"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback>{activity.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-primary">{activity.user}</span>
                        <span className="text-muted-foreground text-sm">{activity.action}</span>
                        <span className="text-muted-foreground text-xs ml-auto">{activity.time}</span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{activity.content}</p>
                      <div className="flex gap-4 mt-3">
                        <Button variant="ghost" size="sm" className="text-xs hover:text-accent">
                          Like
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs hover:text-accent">
                          Comment
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs hover:text-accent">
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
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
              <h3 className="professional-heading text-xl text-primary mb-6 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Library: Articles
              </h3>
              
              <div className="space-y-4">
                {recentArticles.map((article, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-accent/5 to-transparent border border-border rounded-lg hover:border-accent/50 hover:shadow-md transition-all cursor-pointer animate-fade-in group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Posted by {article.author}</span>
                        <span>•</span>
                        <span>{article.date}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
              <h3 className="professional-heading text-xl text-primary mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Events
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event, index) => (
                  <Card 
                    key={index} 
                    className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-border hover:shadow-elegant hover:border-accent/50 transition-all hover:-translate-y-1 cursor-pointer animate-scale-in group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar className="h-6 w-6 text-accent" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {event.attendees} attending
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">{event.date}</p>
                    <Button size="sm" variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      Register Now
                    </Button>
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
