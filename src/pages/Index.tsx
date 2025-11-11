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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-52 h-52 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float" />
      </div>

      <div className="relative w-full max-w-6xl animate-fade-in">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - About TFW */}
          <div className="space-y-6 animate-slide-up">
            <div className="text-center lg:text-left">
              <h1 className="professional-heading text-4xl sm:text-5xl md:text-6xl text-primary mb-6 animate-fade-up drop-shadow-lg">
                TRADE FINANCE WORLD
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-accent rounded-full mb-6 mx-auto lg:mx-0"></div>
            </div>

            <Card className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-border/60 shadow-premium">
              <CardContent className="p-8 space-y-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground text-lg">
                  Welcome to Trade Finance World (TFW)
                </p>
                
                <p>
                  A knowledge-sharing platform created with the objective of exchanging information, insights, and experiences in the field of trade finance. This is an exclusive, members-only forum aimed at fostering meaningful dialogue and learning among professionals and academics connected to trade finance and allied domains.
                </p>

                <p>
                  While this is only a modest beginning, we look forward to widespread participation from across the business, banking, and academic communities.
                </p>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

                <p className="italic text-accent">
                  The spirit of this platform lies in open, constructive discussions and the exchange of views, underpinned by bonhomie and mutual respect.
                </p>

                <p>
                  Originally conceived as a trade finance group of bankers and corporate professionals, the community has since grown to include members from <span className="font-semibold text-foreground">FinTechs, Treasuries, Technology, Digitalisation, and Legal sectors</span>.
                </p>

                <p>
                  We have distinguished members from across the globe, including professionals from <span className="font-semibold text-foreground">FEDAI, ICC, ITFA, ADB, BAFT, NSDL</span>, and even a distinguished representative from the <span className="font-semibold text-foreground">Reserve Bank of India</span>.
                </p>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

                <p className="text-xs text-muted-foreground/80">
                  The platform is administered by <span className="font-semibold">Shudeep Ghosh, Priyanka Chaudhuri, and Pinaki Roy</span>.
                </p>

                <p className="font-medium text-foreground">
                  This website serves as an extended hub for our collective knowledge.
                </p>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-4">
                  <p className="text-center font-semibold text-primary italic">
                    "TradeFinanceWorld (TFW) follows the Conference Room Philosophy — everyone is equal in the conference room."
                  </p>
                </div>

                <p className="text-center font-medium text-foreground pt-2">
                  We welcome you on this journey of collaboration, learning, and shared wisdom in the dynamic world of trade finance.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Login/Signup */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Card className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-border/60 shadow-premium sticky top-8">
          <CardHeader className="space-y-6">
            <CardTitle className="professional-heading text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="banking-text text-center">
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
                    className="w-full bg-gradient-primary hover:shadow-elegant text-primary-foreground font-semibold py-6 rounded-xl transition-all hover:scale-[1.02] btn-premium"
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
                    className="w-full bg-gradient-primary hover:shadow-elegant text-primary-foreground font-semibold py-6 rounded-xl transition-all hover:scale-[1.02] btn-premium"
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
    </div>
  );
};

export default Index;

