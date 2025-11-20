import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users } from 'lucide-react';

interface Member {
  id: string;
  name: string;
}

const members: Member[] = [
  { id: "1", name: "Priyanka Chaudhuri" },
  { id: "2", name: "KhushnamaZDavar" },
  { id: "3", name: "BHASKAR DAS" },
  { id: "4", name: "shudeepghosh@gmail.com" },
  { id: "5", name: "SuperAdmin" },
  { id: "6", name: "GaneshVishwanathan" },
  { id: "7", name: "KEswar" },
  { id: "8", name: "AmishaShah" },
  { id: "9", name: "RajeshIyer" },
  { id: "10", name: "ZaheerSarguroh" },
  { id: "11", name: "AbrarAhmed" },
  { id: "12", name: "Andre Casterman" },
  { id: "13", name: "SaurabhSharma" },
  { id: "14", name: "Sridhar S" },
  { id: "15", name: "Bharat Chandela" },
  { id: "16", name: "Parameswaran" },
  { id: "17", name: "Sunil Makhecha" },
  { id: "18", name: "Kashinath Katakdhond" },
  { id: "19", name: "SridharK" },
  { id: "20", name: "Kishor Parulekar" },
  { id: "21", name: "Chandra Sekhar Pentakota" },
  { id: "22", name: "Vishal Raipure" },
  { id: "23", name: "Vimal Karimbil" },
  { id: "24", name: "Krishnakumar Duraiswamy (KK)" },
  { id: "25", name: "SandipChauhan" },
  { id: "26", name: "SunilKumarJain" },
  { id: "27", name: "RajeswariKesavan" },
  { id: "28", name: "JayantMehrotra" },
  { id: "29", name: "ParshantMittal" },
  { id: "30", name: "Srinath Keshavan" },
  { id: "31", name: "ShirazPercyBadhniwalla" },
  { id: "32", name: "YogeshBelekar" },
  { id: "33", name: "SunilSenapati" },
  { id: "34", name: "AshwaniSindhwani" },
  { id: "35", name: "Ajitabh Bharti" },
  { id: "36", name: "Abin Daya" },
  { id: "37", name: "Richa Mukherjee" },
  { id: "38", name: "RChandraSekhar" },
  { id: "39", name: "GurudattSamant" },
  { id: "40", name: "SripadMurthy" },
  { id: "41", name: "KishorPradhan" },
  { id: "42", name: "ShilpaSadh" },
  { id: "43", name: "Shantanu Pradhan" },
  { id: "44", name: "Pinaki Roy" },
  { id: "45", name: "H D Rathi" },
  { id: "46", name: "Ashok Mogal" },
  { id: "47", name: "Sugandha Sinha" },
  { id: "48", name: "Sanjay Sinha" },
  { id: "49", name: "GSubramaniam" },
  { id: "50", name: "VikramMurarka" },
  { id: "51", name: "GoutamChakraborty" },
  { id: "52", name: "Rahul Gupta" },
  { id: "53", name: "SurathSengupta" },
  { id: "54", name: "Parvaiz" },
  { id: "55", name: "AlexanderRMalaket" },
  { id: "56", name: "Anish" },
  { id: "57", name: "PrashantPillai" },
  { id: "58", name: "RekhaRamanathan" },
  { id: "59", name: "BasudevBhattacharya" },
  { id: "60", name: "KetanGaikwad" },
  { id: "61", name: "Alexander Goulandris" },
  { id: "62", name: "SandeepSahu" },
  { id: "63", name: "Atul Deshpande" },
  { id: "64", name: "SantoshAbraham" },
  { id: "65", name: "JaccoDeJong" },
  { id: "66", name: "MritunjaySingh" },
  { id: "67", name: "RanadeepMookerjee" },
  { id: "68", name: "UtpalKant" },
  { id: "69", name: "VikramLodha" },
  { id: "70", name: "HunyGarg" },
  { id: "71", name: "VineetSharma" },
  { id: "72", name: "VikramBose" },
  { id: "73", name: "VijayandarMotamari" },
  { id: "74", name: "SanjoyBanerjee" },
  { id: "75", name: "DimpleChitnis" },
  { id: "76", name: "SunnyGupta" },
  { id: "77", name: "VivekGupta" },
  { id: "78", name: "KSujatha" },
  { id: "79", name: "ImranKhan" },
  { id: "80", name: "RinsiSud" },
  { id: "81", name: "ParthasarathiMukherjee" },
  { id: "82", name: "GaryCutress" },
  { id: "83", name: "NVChandramouli" },
  { id: "84", name: "BUlagiyan" },
  { id: "85", name: "PARTHA BHATTACHARYYA" },
  { id: "86", name: "BrandonFeng" },
  { id: "87", name: "SatishKumarN" },
  { id: "88", name: "Nimesh Karwanyun" },
  { id: "89", name: "SrikanthRajan" },
  { id: "90", name: "PraveenGupta" },
  { id: "91", name: "VinitMishra" },
  { id: "92", name: "Krishnamoorthy S" },
  { id: "93", name: "LaxmanJoshi" },
  { id: "94", name: "Nita chavan" },
  { id: "95", name: "Ayalur Vasudevan" },
];

const Members = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Check authentication with Supabase
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && mounted) {
        navigate('/auth');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && mounted) {
        navigate('/auth');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Filter members
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-primary opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Enhanced Header */}
        <div className="mb-8 sm:mb-12 text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-primary/10 rounded-full mb-3 sm:mb-4 animate-scale-in">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">
              {members.length}+ Professional Network
            </span>
          </div>
          <h1 className="professional-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-primary bg-clip-text text-transparent px-4">
            Members Directory
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Connect with trade finance professionals from around the globe
          </p>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 animate-scale-in">
          <Card className="p-6 sm:p-8 bg-card/90 backdrop-blur-xl border-border/60 hover:shadow-premium hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 rounded-2xl group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity"></div>
            <div className="flex items-center gap-3 sm:gap-5 relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-500">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {members.length}
                </p>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">Total Members</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Search */}
        <Card className="p-6 sm:p-8 mb-8 sm:mb-10 bg-card/90 backdrop-blur-xl border-border/60 animate-fade-in shadow-elegant hover:shadow-premium transition-all duration-500 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
          <div className="relative w-full">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder="Search members by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 sm:pl-14 pr-4 py-5 sm:py-7 bg-background/50 text-sm sm:text-base rounded-xl border-2 border-border focus:border-primary hover:border-primary/50 transition-all"
            />
          </div>
        </Card>

        {/* Enhanced Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member, index) => (
            <Card 
              key={member.id}
              className="p-8 bg-card/90 backdrop-blur-xl border-border/60 hover:shadow-premium hover:border-primary/60 transition-all duration-500 hover:-translate-y-3 animate-scale-in group cursor-pointer rounded-2xl overflow-hidden relative"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <div className="flex flex-col items-center text-center relative">
                <Avatar className="h-24 w-24 mb-5 border-4 border-primary/20 group-hover:border-primary/60 transition-all duration-500 group-hover:scale-110 shadow-elegant group-hover:shadow-accent">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors duration-300">
                  {member.name}
                </h3>
              </div>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <Card className="p-16 text-center bg-card/90 backdrop-blur-xl rounded-2xl border-border/60 animate-fade-in">
            <Users className="h-20 w-20 text-muted-foreground mx-auto mb-6 opacity-30" />
            <p className="text-lg text-muted-foreground font-medium">No members found matching your search</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Members;
