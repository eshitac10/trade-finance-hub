import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  // Filter members
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="mb-12 animate-fade-up space-y-3">
          <h1 className="professional-heading text-5xl text-primary mb-3 flex items-center gap-4">
            <Users className="h-12 w-12" />
            Members Directory
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse {members.length}+ trade finance professionals
          </p>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 animate-scale-in">
          <Card className="p-8 bg-card/90 backdrop-blur-sm border-border hover:shadow-premium hover:border-accent/50 transition-all duration-500 hover:-translate-y-2 rounded-2xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-elegant">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">{members.length}</p>
                <p className="text-base text-muted-foreground font-medium">Total Members</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Search */}
        <Card className="p-8 mb-10 bg-card/90 backdrop-blur-sm border-border animate-fade-in shadow-elegant hover:shadow-premium transition-all duration-500 rounded-2xl">
          <div className="relative w-full md:w-2/3 lg:w-1/2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 bg-background/50 text-base rounded-xl border-border focus:border-accent transition-all"
            />
          </div>
        </Card>

        {/* Enhanced Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredMembers.map((member, index) => (
            <Card 
              key={member.id}
              className="p-8 bg-card/90 backdrop-blur-sm border-border hover:shadow-premium hover:border-accent/60 transition-all duration-500 hover:-translate-y-3 animate-scale-in group cursor-pointer rounded-2xl"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-5 border-4 border-primary/20 group-hover:border-accent/60 transition-all duration-500 group-hover:scale-110 shadow-elegant">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/15 to-accent/15 text-primary text-xl font-semibold">
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-semibold text-base text-primary group-hover:text-accent transition-colors duration-300">
                  {member.name}
                </h3>
              </div>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No members found matching your search</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Members;
