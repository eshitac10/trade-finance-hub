import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, UserCheck, UserX, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Graph data structure for friend connections
interface FriendshipGraph {
  [userId: string]: {
    friends: Set<string>;
    pendingRequests: Set<string>; // Requests I sent
    receivedRequests: Set<string>; // Requests I received
  };
}

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

const CURRENT_USER_ID = "current-user";

const Members = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Initialize friendship graph
  const [friendGraph, setFriendGraph] = useState<FriendshipGraph>(() => {
    const initialGraph: FriendshipGraph = {};
    // Initialize current user and all members
    [CURRENT_USER_ID, ...members.map(m => m.id)].forEach(id => {
      initialGraph[id] = {
        friends: new Set(),
        pendingRequests: new Set(),
        receivedRequests: new Set(),
      };
    });
    return initialGraph;
  });

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  // Send friend request
  const sendFriendRequest = (targetUserId: string) => {
    setFriendGraph(prev => {
      const newGraph = JSON.parse(JSON.stringify(prev));
      
      // Add to current user's pending requests
      if (!newGraph[CURRENT_USER_ID].pendingRequests) {
        newGraph[CURRENT_USER_ID].pendingRequests = new Set();
      }
      newGraph[CURRENT_USER_ID].pendingRequests = new Set([...newGraph[CURRENT_USER_ID].pendingRequests, targetUserId]);
      
      // Add to target user's received requests
      if (!newGraph[targetUserId].receivedRequests) {
        newGraph[targetUserId].receivedRequests = new Set();
      }
      newGraph[targetUserId].receivedRequests = new Set([...newGraph[targetUserId].receivedRequests, CURRENT_USER_ID]);
      
      return newGraph;
    });

    toast({
      title: "Friend Request Sent",
      description: `Request sent to ${members.find(m => m.id === targetUserId)?.name}`,
    });
  };

  // Accept friend request
  const acceptFriendRequest = (requesterId: string) => {
    setFriendGraph(prev => {
      const newGraph = JSON.parse(JSON.stringify(prev));
      
      // Remove from received requests
      newGraph[CURRENT_USER_ID].receivedRequests = new Set(
        [...newGraph[CURRENT_USER_ID].receivedRequests].filter(id => id !== requesterId)
      );
      
      // Remove from requester's pending
      newGraph[requesterId].pendingRequests = new Set(
        [...newGraph[requesterId].pendingRequests].filter(id => id !== CURRENT_USER_ID)
      );
      
      // Add to both friends lists (bidirectional edge in graph)
      newGraph[CURRENT_USER_ID].friends = new Set([...newGraph[CURRENT_USER_ID].friends, requesterId]);
      newGraph[requesterId].friends = new Set([...newGraph[requesterId].friends, CURRENT_USER_ID]);
      
      return newGraph;
    });

    toast({
      title: "Friend Request Accepted",
      description: `You are now friends with ${members.find(m => m.id === requesterId)?.name}`,
    });
  };

  // Reject friend request
  const rejectFriendRequest = (requesterId: string) => {
    setFriendGraph(prev => {
      const newGraph = JSON.parse(JSON.stringify(prev));
      
      newGraph[CURRENT_USER_ID].receivedRequests = new Set(
        [...newGraph[CURRENT_USER_ID].receivedRequests].filter(id => id !== requesterId)
      );
      newGraph[requesterId].pendingRequests = new Set(
        [...newGraph[requesterId].pendingRequests].filter(id => id !== CURRENT_USER_ID)
      );
      
      return newGraph;
    });

    toast({
      title: "Request Rejected",
      description: "Friend request has been declined",
    });
  };

  // Cancel friend request
  const cancelFriendRequest = (targetUserId: string) => {
    setFriendGraph(prev => {
      const newGraph = JSON.parse(JSON.stringify(prev));
      
      newGraph[CURRENT_USER_ID].pendingRequests = new Set(
        [...newGraph[CURRENT_USER_ID].pendingRequests].filter(id => id !== targetUserId)
      );
      newGraph[targetUserId].receivedRequests = new Set(
        [...newGraph[targetUserId].receivedRequests].filter(id => id !== CURRENT_USER_ID)
      );
      
      return newGraph;
    });

    toast({
      title: "Request Cancelled",
      description: "Friend request has been cancelled",
    });
  };

  // Remove friend
  const removeFriend = (friendId: string) => {
    setFriendGraph(prev => {
      const newGraph = JSON.parse(JSON.stringify(prev));
      
      newGraph[CURRENT_USER_ID].friends = new Set(
        [...newGraph[CURRENT_USER_ID].friends].filter(id => id !== friendId)
      );
      newGraph[friendId].friends = new Set(
        [...newGraph[friendId].friends].filter(id => id !== CURRENT_USER_ID)
      );
      
      return newGraph;
    });

    toast({
      variant: "destructive",
      title: "Friend Removed",
      description: `Removed ${members.find(m => m.id === friendId)?.name} from friends`,
    });
  };

  // Get relationship status
  const getRelationshipStatus = (userId: string): 'friend' | 'pending' | 'received' | 'none' => {
    if (friendGraph[CURRENT_USER_ID]?.friends?.has(userId)) return 'friend';
    if (friendGraph[CURRENT_USER_ID]?.pendingRequests?.has(userId)) return 'pending';
    if (friendGraph[CURRENT_USER_ID]?.receivedRequests?.has(userId)) return 'received';
    return 'none';
  };

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getRelationshipStatus(member.id);
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'friends') return matchesSearch && status === 'friend';
    if (activeTab === 'requests') return matchesSearch && status === 'received';
    return matchesSearch;
  });

  const friendsCount = [...(friendGraph[CURRENT_USER_ID]?.friends || [])].length;
  const requestsCount = [...(friendGraph[CURRENT_USER_ID]?.receivedRequests || [])].length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="professional-heading text-4xl text-primary mb-2 flex items-center gap-3">
            <Users className="h-10 w-10" />
            Members Network
          </h1>
          <p className="text-muted-foreground">
            Connect with {members.length}+ trade finance professionals worldwide
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-scale-in">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-elegant transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{members.length}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-elegant transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{friendsCount}</p>
                <p className="text-sm text-muted-foreground">Your Friends</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-elegant transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{requestsCount}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8 bg-card/80 backdrop-blur-sm border-border animate-fade-in">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-background/50">
                <TabsTrigger value="all">All Members</TabsTrigger>
                <TabsTrigger value="friends">
                  Friends
                  {friendsCount > 0 && (
                    <Badge variant="secondary" className="ml-2">{friendsCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="requests">
                  Requests
                  {requestsCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-orange-500/10 text-orange-600">{requestsCount}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member, index) => {
            const status = getRelationshipStatus(member.id);
            
            return (
              <Card 
                key={member.id}
                className="p-6 bg-card/80 backdrop-blur-sm border-border hover:shadow-elegant hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 animate-scale-in group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4 border-4 border-primary/20 group-hover:border-accent/50 transition-all group-hover:scale-110">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-primary mb-4 group-hover:text-accent transition-colors">
                    {member.name}
                  </h3>
                  
                  {status === 'friend' && (
                    <div className="w-full space-y-2">
                      <Badge className="w-full bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Friends
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                        onClick={() => removeFriend(member.id)}
                      >
                        <UserX className="h-3 w-3 mr-1" />
                        Unfriend
                      </Button>
                    </div>
                  )}
                  
                  {status === 'pending' && (
                    <div className="w-full space-y-2">
                      <Badge className="w-full bg-blue-500/10 text-blue-600 border-blue-500/20">
                        Request Sent
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => cancelFriendRequest(member.id)}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  )}
                  
                  {status === 'received' && (
                    <div className="w-full space-y-2">
                      <Badge className="w-full bg-orange-500/10 text-orange-600 border-orange-500/20">
                        Request Received
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-primary hover:bg-primary-hover"
                          onClick={() => acceptFriendRequest(member.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => rejectFriendRequest(member.id)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {status === 'none' && (
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary-hover shadow-elegant"
                      onClick={() => sendFriendRequest(member.id)}
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Add Friend
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No members found matching your criteria</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Members;
