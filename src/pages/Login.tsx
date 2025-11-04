import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Dummy credentials
const DUMMY_USER = {
  email: 'admin@tfworld.com',
  password: 'admin123'
};

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      // Store authentication state
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in to Trade Finance World.",
      });
      
      setIsLoading(false);
      navigate('/');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20 animate-pulse"></div>
      
      {/* Floating Elements with Animation */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary-foreground/10 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-elegant border border-border/50 p-8 md:p-12 animate-scale-in">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center shadow-elegant animate-fade-in">
              <Lock className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="professional-heading text-3xl md:text-4xl text-primary mb-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Trade Finance World
            </h1>
            <div className="h-1 w-20 bg-accent mx-auto rounded-full mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}></div>
            <p className="text-muted-foreground text-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Access your professional network
            </p>
          </div>

          {/* Demo Credentials Info */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-xs font-semibold text-accent mb-2">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">Email: admin@tfworld.com</p>
            <p className="text-xs text-muted-foreground">Password: admin123</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>
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
                className="h-12 bg-background/50 border-border/50 focus:border-accent transition-all focus:shadow-professional"
                required
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <Label htmlFor="password" className="text-foreground font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-accent" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 focus:border-accent transition-all focus:shadow-professional pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm animate-slide-up" style={{ animationDelay: '0.7s' }}>
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
              disabled={isLoading}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-hover font-semibold shadow-professional hover:shadow-elegant transition-all group animate-slide-up"
              style={{ animationDelay: '0.8s' }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Text */}
          <p className="text-center text-muted-foreground text-sm mt-8 animate-fade-in" style={{ animationDelay: '0.9s' }}>
            For account access, contact your administrator
          </p>
        </div>

        {/* Copyright */}
        <p className="text-center text-primary-foreground/70 text-sm mt-8 animate-fade-in" style={{ animationDelay: '1s' }}>
          © 2024 Trade Finance World. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
