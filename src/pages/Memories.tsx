import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Upload, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Memory {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

const Memories = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchMemories();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUserId(session.user.id);
  };

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

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
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('memories')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('memories')
        .insert({
          user_id: userId,
          image_url: publicUrl,
          caption: null,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Memory uploaded successfully",
      });

      fetchMemories();
    } catch (error) {
      console.error('Error uploading memory:', error);
      toast({
        title: "Error",
        description: "Failed to upload memory",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleEdit = (memory: Memory) => {
    setSelectedMemory(memory);
    setEditCaption(memory.caption || '');
    setEditDialogOpen(true);
  };

  const handleUpdateCaption = async () => {
    if (!selectedMemory) return;

    try {
      const { error } = await supabase
        .from('memories')
        .update({ caption: editCaption })
        .eq('id', selectedMemory.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Caption updated successfully",
      });

      setEditDialogOpen(false);
      fetchMemories();
    } catch (error) {
      console.error('Error updating caption:', error);
      toast({
        title: "Error",
        description: "Failed to update caption",
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
      const fileName = selectedMemory.image_url.split('/').slice(-2).join('/');
      
      await supabase.storage
        .from('memories')
        .remove([fileName]);

      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', selectedMemory.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Memory deleted successfully",
      });

      setDeleteDialogOpen(false);
      fetchMemories();
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast({
        title: "Error",
        description: "Failed to delete memory",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Memories</h1>
          
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label htmlFor="file-upload">
              <Button
                disabled={uploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Memory'}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
              </Card>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No memories yet</h2>
            <p className="text-muted-foreground">Upload your first memory to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <Card key={memory.id} className="overflow-hidden group">
                <CardContent className="p-0 relative">
                  <img
                    src={memory.image_url}
                    alt={memory.caption || 'Memory'}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    {memory.user_id === userId && (
                      <>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleEdit(memory)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteConfirm(memory)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  {memory.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                      <p className="text-sm">{memory.caption}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Caption</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Add a caption..."
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCaption}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this memory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Memories;
