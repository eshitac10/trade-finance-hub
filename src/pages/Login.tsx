import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Mail } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate to home page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20 animate-pulse"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary-foreground/10 rounded-full blur-3xl animate-float-delayed"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-card/95 backdrop-blur-lg rounded-2xl shadow-elegant border border-border/50 p-8 md:p-12 animate-scale-in">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="professional-heading text-3xl md:text-4xl text-primary mb-3 animate-fade-in">
              Trade Finance World
            </h1>
            <div className="h-1 w-20 bg-accent mx-auto rounded-full mb-6"></div>
            <p className="text-muted-foreground text-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Access your professional network
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Label htmlFor="email" className="text-foreground font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-background/50 border-border/50 focus:border-accent transition-colors"
                required
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Label htmlFor="password" className="text-foreground font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-accent" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-background/50 border-border/50 focus:border-accent transition-colors"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <input type="checkbox" className="rounded border-border/50 text-accent focus:ring-accent" />
                Remember me
              </label>
              <a href="#" className="text-accent hover:text-accent-hover transition-colors font-medium">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-hover font-semibold shadow-professional hover:shadow-elegant transition-all group animate-slide-up"
              style={{ animationDelay: '0.5s' }}
            >
              Sign In
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 text-muted-foreground font-medium">New to TFW?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <p className="text-muted-foreground mb-4">
              Join our global community of trade finance professionals
            </p>
            <Button
              variant="outline"
              className="w-full h-12 border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground font-semibold transition-all"
              onClick={() => navigate('/signup')}
            >
              Create Account
            </Button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-primary-foreground/70 text-sm mt-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          © 2024 Trade Finance World. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
