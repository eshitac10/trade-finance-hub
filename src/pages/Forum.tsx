import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, MessageCircle, Clock, TrendingUp } from 'lucide-react';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  topics: number;
  posts: number;
  lastActivity?: {
    user: string;
    time: string;
  };
}

interface Topic {
  id: string;
  title: string;
  posts: number;
  forums: number;
}

const forumCategories: ForumCategory[] = [
  {
    id: '1',
    name: 'DISCUSSIONS TRIGGERED BY FX RETAIL 21-NOV TO 23-NOV, 2020',
    description: 'Conversation On FX Retail',
    topics: 0,
    posts: 0,
  },
  {
    id: '2',
    name: 'Open Discussion',
    description: 'Open to all.',
    topics: 0,
    posts: 0,
  },
  {
    id: '3',
    name: 'Whatsapp Discussion',
    description: '',
    topics: 3,
    posts: 6,
    lastActivity: {
      user: 'SuperAdmin',
      time: '7 years, 4 months ago'
    }
  },
];

const recentTopics: Topic[] = [
  {
    id: '1',
    title: 'BG : Revised claim period – Amendment to article',
    posts: 5,
    forums: 2
  },
  {
    id: '2',
    title: 'Trade Finance Regulations Update',
    posts: 12,
    forums: 3
  },
  {
    id: '3',
    title: 'Digital Banking Transformation',
    posts: 8,
    forums: 1
  },
  {
    id: '4',
    title: 'Documentary Credits Best Practices',
    posts: 15,
    forums: 4
  },
];

const Forum = () => {
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="professional-heading text-4xl text-primary mb-2 flex items-center gap-3">
            <MessageSquare className="h-10 w-10" />
            Forum
          </h1>
          <p className="text-muted-foreground">
            Engage in discussions with trade finance professionals
          </p>
        </div>

        {/* Forum Categories Table */}
        <Card className="mb-8 overflow-hidden bg-card/80 backdrop-blur-sm border-border animate-scale-in">
          <div className="bg-primary text-primary-foreground px-6 py-4">
            <h2 className="professional-heading text-xl">Discussion Forums</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">FORUM</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground w-24">TOPICS</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground w-24">POSTS</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground w-48">FRESHNESS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {forumCategories.map((category, index) => (
                  <tr 
                    key={category.id} 
                    className="hover:bg-accent/5 transition-colors cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <MessageCircle className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-primary hover:text-accent transition-colors mb-1">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground italic">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-lg font-semibold text-primary">{category.topics}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-lg font-semibold text-primary">{category.posts}</span>
                    </td>
                    <td className="px-6 py-5">
                      {category.lastActivity ? (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground italic mb-1">{category.lastActivity.time}</p>
                          <p className="text-xs text-muted-foreground">Last post by {category.lastActivity.user}</p>
                        </div>
                      ) : (
                        <p className="text-center text-sm text-muted-foreground italic">No Topics</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Topics Section */}
        <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-border animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="bg-primary text-primary-foreground px-6 py-4">
            <h2 className="professional-heading text-xl">Topics On the Forums</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">TOPIC</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground w-32">POSTS</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground w-32">FORUMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTopics.map((topic, index) => (
                  <tr 
                    key={topic.id} 
                    className="hover:bg-accent/5 transition-colors cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-accent flex-shrink-0" />
                        <span className="font-medium text-primary hover:text-accent transition-colors">
                          {topic.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {topic.posts}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                        {topic.forums}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create New Topic Button */}
        <div className="mt-8 flex justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground">
            <MessageSquare className="h-5 w-5 mr-2" />
            Start New Discussion
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Forum;
