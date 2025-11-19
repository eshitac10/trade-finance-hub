import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, XCircle } from "lucide-react";

const InitializeAdmins = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);

  const handleInitialize = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bootstrap-admins");

      if (error) throw error;

      setResults(data.results || []);
      setInitialized(true);

      const successCount = data.results.filter((r: any) => r.success).length;
      
      toast({
        title: "Initialization Complete",
        description: `Successfully initialized ${successCount} admin account(s)`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize admin accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-primary" />
            Initialize Admin Accounts
          </CardTitle>
          <CardDescription>
            This will create the admin accounts with predefined credentials. Only run this once during initial setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!initialized ? (
            <>
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <p className="font-semibold">Admins to be created:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    its.priyo
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    pproy1956@gmail.com
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleInitialize}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
                    Initializing...
                  </>
                ) : (
                  "Initialize Admin Accounts"
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-semibold mb-3">
                  Initialization Results:
                </p>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{result.email}</span>
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-600 dark:text-red-400">{result.error}</span>
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Next steps:</strong>
                  <br />
                  1. You can now login with the admin credentials at <a href="/auth" className="underline">/auth</a>
                  <br />
                  2. Access the admin panel at <a href="/admin" className="underline">/admin</a> to manage users
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InitializeAdmins;