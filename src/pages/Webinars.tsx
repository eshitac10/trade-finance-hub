import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, ExternalLink, Video, Sparkles, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Webinar {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
  videoUrl: string;
  description: string;
}


const Webinars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);
  const [newWebinarTitle, setNewWebinarTitle] = useState("");
  const [newWebinarDate, setNewWebinarDate] = useState("");
  const [newWebinarUrl, setNewWebinarUrl] = useState("");
  const [newWebinarDescription, setNewWebinarDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gDriveVideos, setGDriveVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
    };
    
    checkAuth();
    loadWebinars();
    fetchGDriveVideos();
  }, [navigate]);

  const fetchGDriveVideos = async () => {
    setLoadingVideos(true);
    try {
      const webinarData = [
        { date: '12-Dec-20', title: 'TFW 2nd Webinar: Discussion On CBDC', fileId: '1MbYPNi2zjSXpe6SN64K-n1K_IKr4Xd3K' },
        { date: '27-Feb-21', title: 'TFW 3rd Webinar: Digitisation of documents and their legal enforceability in the Indian context', fileId: '13fmfpA-zMLw0fI2-m4VatIAa-7oITzSK' },
        { date: '15-May-21', title: 'TFW 4th Webinar: Digitisation - The Journey So Far and the Road Ahead', fileId: '1rSeA_5pqs9suR7XFKVQPMp1Zup9084v7' },
        { date: '10-Jul-21', title: 'TFW 5th Webinar: An hour with André Casterman', fileId: '1WtNUnrxWj48Ctq8lGy5ulBXuVc3q-m5l' },
        { date: '6-Aug-21', title: 'TFW 6th Webinar: International Trade, Supply Chain Finance and Sustainable Trade', fileId: '1jwSLCAqLvPhTwtWcDxCZOsGIRw5YWeV3' },
        { date: '18-Sep-21', title: 'TFW 7th Webinar: Nicks and Bruises: The seasoning of a Trade Finance Journeyman', fileId: '1sfeNmKx7Tlss1vMPNKveJx0pI6WRhKCG' },
        { date: '18-Dec-21', title: 'TFW 8th Webinar: A session on our Industry\'s flagship Fintech Initiatives', fileId: '1BPb5CtL0x_UJ-OZ6kztBg72teaxzn1YC' },
        { date: '9-Apr-22', title: 'TFW 10th Webinar: Managing Financial Crimes In The Metaverse__Will Trade Finance Digitization help', fileId: '10Pg8WtPqPdZYXzIIw7m-pysU2c2w7DK5' },
        { date: '6-Jun-22', title: 'TFW 11th Webinar: Recent updates in the Digital Trade Finance', fileId: '15ATxSLmHzNz8ubLTz0jjGLxhqBPk3z6C' },
        { date: '27-Aug-22', title: 'TFW 12th Webinar: Emerging trends in Supply Chains and Global Supply Chain', fileId: '19jC2HMi8n00Knf6wFpnZuCAXXCo0Hq4b' },
        { date: '24-Sep-22', title: 'TFW 13th Webinar: Non-Payment Insurance and consequential Regulatory Capital Relief', fileId: '1iOwr8_sH6bKy4UgrMf0tw09Dhl5t-yRE' },
        { date: '20-Jan-23', title: 'TFW 15th Webinar: Supply Chain Fin Sols & Policy Developments for Nego Inst & Digital Assets', fileId: '17S08vGLUdnLrDMoTjLSciBUbzJYQAn0m' },
        { date: '22-Apr-23', title: 'TFW 16th Webinar: The changes in UK Laws regarding digitized negotiable instruments & Getting all Bill of Ladings in digital form by 2030', fileId: '1S31rVofQC4o-fwISCdVSNhpi3j-YzyMf' },
        { date: '10-Jun-23', title: 'TFW 17th Webinar: The Development Impact of Trade and Trade Financing', fileId: '1wbbmzIuwo7yxEYBYC6TXY0pqSfExbgKR' },
        { date: '2-Sep-23', title: 'TFW 18th Webinar: How a large Global Giant of SCF provider Handles complexity in business of supply chain financing across 122 locations', fileId: '1qJ0_0Wgl1iI-EXqB4fy9Vl_AgeD7VrGQ' },
        { date: '14-Oct-23', title: 'TFW 19th Webinar: Discussion on ADB Trade Finance Gaps, Growth and Jobs Survey, 2023', fileId: '1RwPqD4__gBDSBja36PVylNRg9vFs2G-G' },
        { date: '30-Dec-23', title: 'TFW 20th Webinar: Inventory The Last Frontier in Working Capital Management', fileId: '1doJT8RDvnXLWe2xknR7OVcVAO2CpuKK2' },
        { date: '1-Mar-24', title: 'TFW 21st Webinar: Receivables Exchange of India Limited (RXIL)\'s journey and future trends in TReDS platform', fileId: '182f-UsXO4mD_Hd7VsiPijDVOF6D3cGkc' },
        { date: '20-Apr-24', title: 'TFW 22nd Webinar: SWIFT innovations in Trade Finance, Quo vadis Digitisation, Basel IV and beyond', fileId: '1CgXEPHstnZUbnKuqKeH3pRaDjbxtfXKZ' },
        { date: '21-Sep-24', title: 'TFW 23rd Webinar: Bullion Trade, Bullion Exchange and Impact on Indian Economy G&J Sector', fileId: '18NvBSkveQRwuarqVNCjO7ix9gLmWL_RQ' },
        { date: '18-Dec-24', title: 'TFW 24th Webinar: CBDC - a law enforcement perspective', fileId: '1xsOhnKx2gFng1VLhWc7TSgkSRiorgVTh' },
        { date: '12-Apr-25', title: 'TFW 26th Webinar: Introduction to Future of Finance Infrastructure', fileId: '1HAPaEe1On_dlEBQezBr3r6o-cEZau20m' },
        { date: '20-Sep-25', title: 'TFW 27th Webinar: Scaling eBL Adoption in the Age of MLETR, Interoperability and New Digital Trade Finance Use Cases', fileId: '18d_fdnYzrpgf62R6ETTm6sn_5NAjWUD-' }
      ];

      const videoPromises = webinarData.map(webinar =>
        supabase.functions.invoke('fetch-google-drive', {
          body: { fileId: webinar.fileId }
        }).then(result => ({
          ...result,
          date: webinar.date,
          title: webinar.title
        }))
      );

      const results = await Promise.all(videoPromises);
      const videos = results
        .filter(result => !result.error && result.data?.file)
        .map(result => ({
          ...result.data.file,
          name: result.title,
          date: result.date
        }));

      setGDriveVideos(videos);
    } catch (error) {
      console.error('Error fetching Google Drive videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const loadWebinars = () => {
    const defaultWebinars: Webinar[] = [];
    
    const savedWebinars = localStorage.getItem('webinars');
    if (savedWebinars) {
      setWebinars(JSON.parse(savedWebinars));
    } else {
      setWebinars(defaultWebinars);
      localStorage.setItem('webinars', JSON.stringify(defaultWebinars));
    }
  };

  const handleWebinarClick = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
  };

  const handleWatchOnYouTube = () => {
    if (selectedWebinar) {
      window.open(selectedWebinar.videoUrl, "_blank", "noopener,noreferrer");
      setSelectedWebinar(null);
    }
  };

  const handleAddWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebinarTitle.trim() || !newWebinarUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const videoId = newWebinarUrl.split("v=")[1]?.split("&")[0] || "";
      const newWebinar: Webinar = {
        id: Date.now().toString(),
        title: newWebinarTitle,
        date: newWebinarDate,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        videoUrl: newWebinarUrl,
        description: newWebinarDescription,
      };

      const updatedWebinars = [...webinars, newWebinar];
      setWebinars(updatedWebinars);
      localStorage.setItem('webinars', JSON.stringify(updatedWebinars));

      toast({
        title: "Success!",
        description: "Webinar added successfully.",
      });

      setNewWebinarTitle("");
      setNewWebinarDate("");
      setNewWebinarUrl("");
      setNewWebinarDescription("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add webinar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWebinar) return;

    setIsSubmitting(true);
    try {
      const videoId = editingWebinar.videoUrl.split("v=")[1]?.split("&")[0] || "";
      const updatedWebinar: Webinar = {
        ...editingWebinar,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };

      const updatedWebinars = webinars.map(w => w.id === updatedWebinar.id ? updatedWebinar : w);
      setWebinars(updatedWebinars);
      localStorage.setItem('webinars', JSON.stringify(updatedWebinars));

      toast({
        title: "Success!",
        description: "Webinar updated successfully.",
      });

      setEditingWebinar(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update webinar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWebinar = async (id: string) => {
    try {
      const updatedWebinars = webinars.filter(w => w.id !== id);
      setWebinars(updatedWebinars);
      localStorage.setItem('webinars', JSON.stringify(updatedWebinars));

      toast({
        title: "Success!",
        description: "Webinar deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete webinar",
        variant: "destructive",
      });
    }
  };

  const getEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Past Webinars
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
              Explore our collection of trade finance webinars and insights
            </p>
            <p className="text-sm text-muted-foreground">
              Total Webinars: {gDriveVideos.length}
            </p>
          </div>

          {loadingVideos ? (
            <div className="mb-12 text-center text-muted-foreground">
              Loading webinars from Google Drive...
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {gDriveVideos.map((video, index) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/20">
                  <CardContent className="p-6">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-4">
                      <iframe
                        src={`https://drive.google.com/file/d/${video.id}/preview`}
                        width="100%"
                        height="100%"
                        allow="autoplay"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{video.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {video.date}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(video.webViewLink, '_blank')}
                        className="ml-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Webinars;
