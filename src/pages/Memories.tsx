import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Folder, FolderPlus, Image as ImageIcon, Video, MoveHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import memoriesPattern from "@/assets/memories-pattern-bg.jpg";
import memoriesHero from "@/assets/memories-hero.jpg";

interface Memory {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  folder_id: string | null;
  file_type: string;
}

interface MemoryFolder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  cover_url?: string | null;
}

const Memories = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [folders, setFolders] = useState<MemoryFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [selectedUploadFolder, setSelectedUploadFolder] = useState<string | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [targetFolder, setTargetFolder] = useState<string | null>(null);
  const [editFolderId, setEditFolderId] = useState<string | null>(null);
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [selectedFolderToDelete, setSelectedFolderToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editCoverDialogOpen, setEditCoverDialogOpen] = useState(false);
  const [selectedFolderForCover, setSelectedFolderForCover] = useState<MemoryFolder | null>(null);
  const [coverImageSource, setCoverImageSource] = useState<'upload' | 'select' | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (currentUserId) {
      fetchFolders();
      fetchMemories();
    }
  }, [currentUserId, selectedFolder]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
      return;
    }
    setCurrentUserId(session.user.id);
    
    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();
    
    setIsAdmin(!!roles);
  };

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('memory_folders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchMemories = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedFolder) {
        query = query.eq('folder_id', selectedFolder);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast({
        title: "Error",
        description: "Failed to load memories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('memory_folders')
        .insert({
          name: newFolderName,
          user_id: currentUserId
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Folder created successfully",
      });

      setNewFolderName("");
      setNewFolderDialogOpen(false);
      fetchFolders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (selectedFile.size > maxSize) {
      toast({
        title: "Error",
        description: "File size must be less than 500MB",
        variant: "destructive",
      });
      return;
    }

    const isVideo = selectedFile.type.startsWith('video/');
    const isImage = selectedFile.type.startsWith('image/');

    if (!isVideo && !isImage) {
      toast({
        title: "Error",
        description: "Please select an image or video file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('memories')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('memories')
        .insert({
          user_id: currentUserId,
          image_url: publicUrl,
          caption: uploadCaption || null,
          folder_id: selectedUploadFolder || null,
          file_type: isVideo ? 'video' : 'image'
        });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: `${isVideo ? 'Video' : 'Image'} uploaded successfully`,
      });

      setSelectedFile(null);
      setUploadCaption("");
      setSelectedUploadFolder(null);
      setIsUploadDialogOpen(false);
      // Refresh folders and memories
      await fetchFolders();
      await fetchMemories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (memory: Memory) => {
    setSelectedMemory(memory);
    setNewCaption(memory.caption || "");
    setEditFolderId(memory.folder_id);
    setEditDialogOpen(true);
  };

  const handleUpdateCaption = async () => {
    if (!selectedMemory) return;

    try {
      const { error } = await supabase
        .from('memories')
        .update({ 
          caption: newCaption,
          folder_id: editFolderId
        })
        .eq('id', selectedMemory.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Memory updated successfully",
      });

      setEditDialogOpen(false);
      fetchMemories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update memory",
        variant: "destructive",
      });
    }
  };

  const handleMoveMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    setTargetFolder(memory.folder_id);
    setMoveDialogOpen(true);
  };

  const handleMoveConfirm = async () => {
    if (!selectedMemory) return;

    try {
      const { error } = await supabase
        .from('memories')
        .update({ folder_id: targetFolder })
        .eq('id', selectedMemory.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Memory moved successfully",
      });

      setMoveDialogOpen(false);
      fetchMemories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move memory",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = (memory: Memory) => {
    setSelectedMemory(memory);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMemory) return;

    try {
      const urlPath = selectedMemory.image_url.split('/memories/')[1];
      
      const { error: storageError } = await supabase.storage
        .from('memories')
        .remove([urlPath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('memories')
        .delete()
        .eq('id', selectedMemory.id);

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Memory deleted successfully",
      });

      setDeleteDialogOpen(false);
      fetchMemories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete memory",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolderConfirm = (folderId: string, folderName: string) => {
    setSelectedFolderToDelete({ id: folderId, name: folderName });
    setDeleteFolderDialogOpen(true);
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolderToDelete) return;

    try {
      const { error } = await supabase
        .from('memory_folders')
        .delete()
        .eq('id', selectedFolderToDelete.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Folder deleted successfully",
      });

      if (selectedFolder === selectedFolderToDelete.id) {
        setSelectedFolder(null);
      }
      setDeleteFolderDialogOpen(false);
      fetchFolders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const handleEditCover = (folder: MemoryFolder) => {
    setSelectedFolderForCover(folder);
    setCoverImageSource(null);
    setSelectedCoverFile(null);
    setEditCoverDialogOpen(true);
  };

  const handleUploadCover = async () => {
    if (!selectedFolderForCover || !selectedCoverFile) return;

    try {
      const fileExt = selectedCoverFile.name.split('.').pop();
      const fileName = `covers/${selectedFolderForCover.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(fileName, selectedCoverFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('memories')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('memory_folders')
        .update({ cover_url: publicUrl })
        .eq('id', selectedFolderForCover.id);

      if (updateError) throw updateError;

      toast({
        title: "Success!",
        description: "Folder cover updated successfully",
      });

      setEditCoverDialogOpen(false);
      fetchFolders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update cover",
        variant: "destructive",
      });
    }
  };

  const handleSelectMemoryAsCover = async (memoryUrl: string) => {
    if (!selectedFolderForCover) return;

    try {
      const { error } = await supabase
        .from('memory_folders')
        .update({ cover_url: memoryUrl })
        .eq('id', selectedFolderForCover.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Folder cover updated successfully",
      });

      setEditCoverDialogOpen(false);
      fetchFolders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update cover",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Background Graphics */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <img src={memoriesPattern} alt="" className="w-full h-full object-cover" />
      </div>
      
      <div className="absolute top-0 left-0 w-full h-96 opacity-10 pointer-events-none">
        <img src={memoriesHero} alt="" className="w-full h-full object-cover mix-blend-overlay" />
      </div>
      
      <div className="absolute top-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-delayed"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="professional-heading text-5xl md:text-6xl font-bold text-foreground">
            Memories
          </h1>
          <div className="flex gap-2">
            <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-accent to-primary hover:shadow-premium transition-all text-accent-foreground font-bold rounded-xl">
                  <FolderPlus className="h-5 w-5 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/98 backdrop-blur-2xl border-accent/30 shadow-2xl rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="professional-heading text-3xl bg-gradient-primary bg-clip-text text-transparent">Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="space-y-3">
                    <Label className="banking-text text-base font-semibold">Folder Name</Label>
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="e.g., Family, Vacations, Events..."
                      className="border-border/60 h-12 text-base rounded-xl focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Button
                    onClick={handleCreateFolder}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:shadow-premium transition-all text-primary-foreground font-bold rounded-xl"
                  >
                    <FolderPlus className="h-5 w-5 mr-2" />
                    Create Folder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-premium transition-all text-primary-foreground font-bold rounded-xl">
                  <Plus className="h-5 w-5 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/98 backdrop-blur-2xl border-accent/30 shadow-2xl rounded-2xl max-w-lg">
                <DialogHeader>
                  <DialogTitle className="professional-heading text-3xl bg-gradient-primary bg-clip-text text-transparent">Upload Memory</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="space-y-3">
                    <Label className="banking-text text-base font-semibold flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      Select Folder (Optional)
                    </Label>
                    <select
                      value={selectedUploadFolder || ""}
                      onChange={(e) => setSelectedUploadFolder(e.target.value || null)}
                      className="w-full px-4 py-3 border border-border/60 rounded-xl bg-background/50 backdrop-blur-sm h-12 text-base focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      <option value="">📂 No Folder (All Memories)</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          📁 {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="banking-text text-base font-semibold flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      File (Image or Video)
                    </Label>
                    <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                      <input
                        type="file"
                        id="memory-upload"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="memory-upload" className="cursor-pointer">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <div className="p-3 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                            <ImageIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="p-3 bg-accent/10 rounded-full group-hover:scale-110 transition-transform">
                            <Video className="h-6 w-6 text-accent" />
                          </div>
                        </div>
                        <p className="banking-text text-base text-foreground mb-2 font-medium">
                          {selectedFile ? `✓ ${selectedFile.name}` : "Click to upload image or video"}
                        </p>
                        <p className="banking-text text-sm text-muted-foreground">
                          Maximum file size: 500MB
                        </p>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="banking-text text-base font-semibold flex items-center gap-2">
                      <Edit2 className="h-4 w-4" />
                      Caption (Optional)
                    </Label>
                    <Input
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder="Add a memorable caption..."
                      className="border-border/60 h-12 text-base rounded-xl focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Button
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:shadow-premium transition-all text-primary-foreground font-bold rounded-xl"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Upload Memory
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Folder Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={selectedFolder === null ? "default" : "outline"}
            onClick={() => setSelectedFolder(null)}
            className="flex items-center gap-2"
          >
            <Folder className="h-4 w-4" />
            All Memories
          </Button>
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center gap-1">
              <Button
                variant={selectedFolder === folder.id ? "default" : "outline"}
                onClick={() => setSelectedFolder(folder.id)}
                className="flex items-center gap-2"
              >
                <Folder className="h-4 w-4" />
                {folder.name}
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditCover(folder)}
                  className="h-8 w-8 p-0 text-primary hover:text-primary"
                  title="Edit folder cover"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteFolderConfirm(folder.id, folder.name)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-xl border-border/60 text-center py-16">
            <CardContent>
              <div className="h-20 w-20 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="professional-heading text-xl font-semibold mb-2">No Memories Yet</h3>
              <p className="banking-text text-muted-foreground">
                Upload your first photo or video to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <Card
                key={memory.id}
                className="bg-card dark:bg-card backdrop-blur-xl border-border/60 overflow-hidden hover:shadow-premium transition-all duration-300 group"
              >
                <div className="relative">
                  {memory.file_type === 'video' ? (
                    <video
                      src={memory.image_url}
                      controls
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <img
                      src={memory.image_url}
                      alt={memory.caption || "Memory"}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  {currentUserId === memory.user_id && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(memory)}
                        className="bg-background/90 backdrop-blur-sm"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMoveMemory(memory)}
                        className="bg-background/90 backdrop-blur-sm"
                      >
                        <MoveHorizontal className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteConfirm(memory)}
                        className="bg-destructive/90 backdrop-blur-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {memory.caption && (
                  <CardContent className="p-4">
                    <p className="banking-text text-sm text-muted-foreground">{memory.caption}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
            <DialogHeader>
              <DialogTitle className="professional-heading text-2xl">Edit Memory</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="banking-text text-sm font-medium mb-2 block">Caption</Label>
                <Input
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Enter caption..."
                  className="border-border/60"
                />
              </div>
              <div>
                <Label className="banking-text text-sm font-medium mb-2 block">Move to Folder</Label>
                <select
                  value={editFolderId || ""}
                  onChange={(e) => setEditFolderId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg bg-background"
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleUpdateCaption}
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground font-bold"
              >
                Update Memory
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Move Dialog */}
        <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
          <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
            <DialogHeader>
              <DialogTitle className="professional-heading text-2xl">Move to Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="banking-text text-sm font-medium mb-2 block">Select Folder</Label>
                <select
                  value={targetFolder || ""}
                  onChange={(e) => setTargetFolder(e.target.value || null)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg bg-background"
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleMoveConfirm}
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground font-bold"
              >
                Move Memory
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Memory Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
            <AlertDialogHeader>
              <AlertDialogTitle className="professional-heading text-2xl">Delete Memory</AlertDialogTitle>
              <AlertDialogDescription className="banking-text">
                Are you sure you want to delete this memory? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Folder Dialog */}
        <AlertDialog open={deleteFolderDialogOpen} onOpenChange={setDeleteFolderDialogOpen}>
          <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
            <AlertDialogHeader>
              <AlertDialogTitle className="professional-heading text-2xl">Delete Folder</AlertDialogTitle>
              <AlertDialogDescription className="banking-text">
                Are you sure you want to delete <strong>{selectedFolderToDelete?.name}</strong>? 
                This will not delete the memories inside, but they will be moved to "All Memories".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteFolder}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Folder
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Folder Cover Dialog */}
        <Dialog open={editCoverDialogOpen} onOpenChange={setEditCoverDialogOpen}>
          <DialogContent className="bg-card/98 backdrop-blur-2xl border-accent/30 shadow-2xl rounded-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="professional-heading text-3xl bg-gradient-primary bg-clip-text text-transparent">
                Edit Folder Cover - {selectedFolderForCover?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {!coverImageSource ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setCoverImageSource('upload')}
                    className="h-32 bg-gradient-to-br from-primary to-accent hover:shadow-premium transition-all text-primary-foreground font-bold rounded-xl flex flex-col gap-2"
                  >
                    <Plus className="h-8 w-8" />
                    Upload from Gallery
                  </Button>
                  <Button
                    onClick={() => setCoverImageSource('select')}
                    className="h-32 bg-gradient-to-br from-accent to-primary hover:shadow-premium transition-all text-accent-foreground font-bold rounded-xl flex flex-col gap-2"
                  >
                    <ImageIcon className="h-8 w-8" />
                    Choose from Folder
                  </Button>
                </div>
              ) : coverImageSource === 'upload' ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                    <input
                      type="file"
                      id="cover-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setSelectedCoverFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      <div className="p-4 bg-primary/10 rounded-full inline-block mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-8 w-8 text-primary" />
                      </div>
                      <p className="banking-text text-base text-foreground mb-2 font-medium">
                        {selectedCoverFile ? `✓ ${selectedCoverFile.name}` : "Click to upload cover image"}
                      </p>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCoverImageSource(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleUploadCover}
                      disabled={!selectedCoverFile}
                      className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-premium transition-all text-primary-foreground font-bold"
                    >
                      Set as Cover
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="banking-text text-sm text-muted-foreground">
                    Select a memory from this folder to use as cover:
                  </p>
                  <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {memories
                      .filter(m => m.folder_id === selectedFolderForCover?.id && m.file_type === 'image')
                      .map((memory) => (
                        <button
                          key={memory.id}
                          onClick={() => handleSelectMemoryAsCover(memory.image_url)}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all group"
                        >
                          <img
                            src={memory.image_url}
                            alt={memory.caption || "Memory"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold">Select</span>
                          </div>
                        </button>
                      ))}
                  </div>
                  <Button
                    onClick={() => setCoverImageSource(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Back
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Memories;
