import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import loginGraphic from "@/assets/login-graphic.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast({
        title: "Login Successful",
        description: "Welcome back to Trade Finance World!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: signupFullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account Created!",
        description: "Your account has been created successfully. You can now log in.",
      });

      // Switch to login tab
      setLoginEmail(signupEmail);
      setSignupEmail("");
      setSignupPassword("");
      setSignupFullName("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToLogin = () => {
    const loginSection = document.getElementById('login-section');
    if (loginSection) {
      loginSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10"></div>
      
      {/* Login graphic overlay */}
      <div className="absolute inset-0 opacity-20">
        <img src={loginGraphic} alt="" className="w-full h-full object-cover mix-blend-overlay" />
      </div>
      
      {/* Animated decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float opacity-40" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float-delayed opacity-30" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gold/10 rounded-full blur-2xl animate-float opacity-25" 
             style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float-delayed opacity-20" />
      </div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" 
           style={{ backgroundImage: 'linear-gradient(rgba(201, 169, 97, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 169, 97, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 lg:py-16 space-y-12 sm:space-y-16 animate-fade-in">
        {/* About Section */}
        <div className="space-y-6 sm:space-y-8 animate-slide-up">
          <div className="text-center space-y-6">
            <h1 className="helvetica-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary mb-4 sm:mb-6 animate-fade-up drop-shadow-lg uppercase tracking-wide whitespace-nowrap">
              Trade Finance World
            </h1>
            <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-primary via-accent to-gold rounded-full mb-6 mx-auto shadow-gold"></div>
            
            {/* Login Button - Before About Content */}
            <Button 
              onClick={scrollToLogin}
              size="lg"
              className="bg-gradient-to-r from-primary via-accent to-primary hover:shadow-elegant hover:shadow-gold/50 text-primary-foreground helvetica-bold px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105 btn-premium text-base sm:text-lg"
            >
              Login to Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-card/98 to-card/90 backdrop-blur-xl border-gold/30 shadow-elegant hover:shadow-premium transition-all duration-500">
            <CardContent className="p-6 sm:p-8 space-y-4 text-sm sm:text-base leading-relaxed text-muted-foreground banking-text">
              <p className="helvetica-bold text-foreground text-lg sm:text-xl">
                Welcome to Trade Finance World (TFW)
              </p>
              
              <p>
                A knowledge-sharing platform created with the objective of exchanging information, insights, and experiences in the field of trade finance. This is an exclusive, members-only forum aimed at fostering meaningful dialogue and learning among professionals and academics connected to trade finance and allied domains.
              </p>

              <p>
                While this is only a modest beginning, we look forward to widespread participation from across the business, banking, and academic communities.
              </p>

              <div className="my-6 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>

              <p className="italic text-accent helvetica-bold">
                The spirit of this platform lies in open, constructive discussions and the exchange of views, underpinned by bonhomie and mutual respect.
              </p>

              <p>
                Originally conceived as a trade finance group of bankers and corporate professionals, the community has since grown to include members from <span className="helvetica-bold text-foreground">FinTechs, Treasuries, Technology, Digitalisation, and Legal sectors</span>.
              </p>

              <p>
                We have distinguished members from across the globe, including professionals from <span className="helvetica-bold text-foreground">FEDAI, ICC, ITFA, ADB, BAFT, NSDL</span>, and even a distinguished representative from the <span className="helvetica-bold text-foreground">Reserve Bank of India</span>.
              </p>

              <div className="my-6 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>

              <p className="text-xs text-muted-foreground/90">
                The platform is administered by <span className="helvetica-bold text-foreground">Shudeep Ghosh, Priyanka Chaudhuri, and Pinaki Roy</span>.
              </p>

              <p className="helvetica-bold text-foreground">
                This website serves as an extended hub for our collective knowledge.
              </p>

              <div className="bg-gradient-to-r from-primary/5 via-gold/10 to-accent/5 border border-gold/30 rounded-xl p-4 sm:p-5 mt-4 shadow-gold hover:shadow-accent transition-all duration-300">
                <p className="text-center helvetica-bold text-primary italic text-sm sm:text-base">
                  "TradeFinanceWorld (TFW) follows the Conference Room Philosophy — everyone is equal in the conference room."
                </p>
              </div>

              <p className="text-center helvetica-bold text-foreground pt-2">
                We welcome you on this journey of collaboration, learning, and shared wisdom in the dynamic world of trade finance.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Login Section */}
        <div id="login-section" className="flex justify-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Card className="w-full max-w-md bg-gradient-to-br from-card/98 to-card/90 backdrop-blur-xl border-gold/30 shadow-elegant hover:shadow-premium transition-all duration-500">
            <CardHeader className="space-y-4 sm:space-y-6">
              <CardTitle className="helvetica-bold text-2xl sm:text-3xl text-center bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent">Welcome</CardTitle>
              <CardDescription className="banking-text text-center text-sm sm:text-base">
                Login or create an account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="banking-text font-semibold">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10 border-2 border-border/60 rounded-xl hover:border-primary/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="banking-text font-semibold">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10 border-2 border-border/60 rounded-xl hover:border-primary/50 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:shadow-elegant hover:shadow-gold/50 text-primary-foreground helvetica-bold py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] btn-premium"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          Login
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="banking-text font-semibold">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          value={signupFullName}
                          onChange={(e) => setSignupFullName(e.target.value)}
                          className="pl-10 border-2 border-border/60 rounded-xl hover:border-primary/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="banking-text font-semibold">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="pl-10 border-2 border-border/60 rounded-xl hover:border-primary/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="banking-text font-semibold">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pl-10 pr-10 border-2 border-border/60 rounded-xl hover:border-primary/50 transition-all"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="banking-text font-semibold">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 border-2 border-border/60 rounded-xl hover:border-primary/50 transition-all"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:shadow-elegant hover:shadow-gold/50 text-primary-foreground helvetica-bold py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] btn-premium"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

