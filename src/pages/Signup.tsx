import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Mail, User, Building2 } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate to home page
    navigate('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center py-12">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20 animate-pulse"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary-foreground/10 rounded-full blur-3xl animate-float-delayed"></div>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-card/95 backdrop-blur-lg rounded-2xl shadow-elegant border border-border/50 p-8 md:p-12 animate-scale-in">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="professional-heading text-3xl md:text-4xl text-primary mb-3 animate-fade-in">
              Join Trade Finance World
            </h1>
            <div className="h-1 w-20 bg-accent mx-auto rounded-full mb-6"></div>
            <p className="text-muted-foreground text-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Create your professional account
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Label htmlFor="fullName" className="text-foreground font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Smith"
                value={formData.fullName}
                onChange={handleChange}
                className="h-12 bg-background/50 border-border/50 focus:border-accent transition-colors"
                required
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.25s' }}>
              <Label htmlFor="email" className="text-foreground font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.smith@company.com"
                value={formData.email}
                onChange={handleChange}
                className="h-12 bg-background/50 border-border/50 focus:border-accent transition-colors"
                required
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Label htmlFor="company" className="text-foreground font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent" />
                Company/Organization
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="Your Company Name"
                value={formData.company}
                onChange={handleChange}
                className="h-12 bg-background/50 border-border/50 focus:border-accent transition-colors"
                required
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.35s' }}>
              <Label htmlFor="password" className="text-foreground font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-accent" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={handleChange}
                className="h-12 bg-background/50 border-border/50 focus:border-accent transition-colors"
                required
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Label htmlFor="confirmPassword" className="text-foreground font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-accent" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="h-12 bg-background/50 border-border/50 focus:border-accent transition-colors"
                required
              />
            </div>

            <div className="flex items-start gap-2 text-sm animate-slide-up" style={{ animationDelay: '0.45s' }}>
              <input type="checkbox" className="mt-1 rounded border-border/50 text-accent focus:ring-accent" required />
              <label className="text-muted-foreground">
                I agree to the{' '}
                <a href="#" className="text-accent hover:text-accent-hover transition-colors font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-accent hover:text-accent-hover transition-colors font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-hover font-semibold shadow-professional hover:shadow-elegant transition-all group animate-slide-up"
              style={{ animationDelay: '0.5s' }}
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 text-muted-foreground font-medium">Already a member?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <Button
              variant="outline"
              className="w-full h-12 border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground font-semibold transition-all"
              onClick={() => navigate('/login')}
            >
              Sign In Instead
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

export default Signup;
