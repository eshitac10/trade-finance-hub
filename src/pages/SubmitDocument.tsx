import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, Download, Edit2, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  description: string | null;
  uploaded_at: string;
}

const SubmitDocument = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setUserId(session.user.id);
    fetchDocuments(session.user.id);
  };

  const fetchDocuments = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", uid)
      .order("uploaded_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load documents.",
        variant: "destructive",
      });
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 20971520) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 20MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) return;

    setUploading(true);
    try {
      // Upload to storage
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          description: description || null,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Document uploaded successfully.",
      });

      setFile(null);
      setDescription("");
      fetchDocuments(userId);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setEditDescription(doc.description || "");
  };

  const handleUpdateDescription = async () => {
    if (!editingDoc) return;

    try {
      const { error } = await supabase
        .from("documents")
        .update({ description: editDescription })
        .eq("id", editingDoc.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Description updated successfully.",
      });

      setEditingDoc(null);
      if (userId) fetchDocuments(userId);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Document deleted successfully.",
      });

      if (userId) fetchDocuments(userId);
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background border-b border-border/40">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center mb-6 animate-fade-in">
            <div className="bg-gradient-primary p-4 rounded-2xl shadow-elegant">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="professional-heading text-5xl md:text-6xl text-center mb-6 animate-fade-in">
            Document Management
          </h1>
          <p className="banking-text text-center text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
            Upload, manage, and organize your documents securely. Maximum file size: 20MB
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Section */}
        <Card className="mb-12 bg-gradient-to-br from-card/80 via-card to-card/60 backdrop-blur-xl border-border/60 shadow-premium hover:shadow-elegant transition-all duration-500 animate-scale-in">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-primary p-3 rounded-xl">
                <Upload className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="professional-heading text-3xl">Upload New Document</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="file" className="banking-text text-base font-semibold mb-3 block">
                  Select File
                </Label>
                <div className="relative">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="banking-text border-2 border-border/60 rounded-xl py-6 hover:border-primary/50 transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-semibold hover:file:bg-primary/90"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                </div>
                {file && (
                  <div className="mt-3 flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="banking-text font-semibold text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="hover:bg-destructive/10 hover:text-destructive rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="banking-text text-base font-semibold mb-3 block">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for this document..."
                  className="banking-text border-2 border-border/60 rounded-xl min-h-[100px] resize-none hover:border-primary/50 transition-all"
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-gradient-primary hover:shadow-elegant text-primary-foreground font-semibold py-6 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-primary p-3 rounded-xl">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="professional-heading text-3xl">Your Documents</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : documents.length === 0 ? (
            <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-xl border-border/40 shadow-soft">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="banking-text text-muted-foreground text-lg">
                  No documents uploaded yet. Upload your first document above!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {documents.map((doc, index) => (
                <Card
                  key={doc.id}
                  className="bg-gradient-to-br from-card/80 via-card to-card/60 backdrop-blur-xl border-border/60 shadow-soft hover:shadow-elegant transition-all duration-300 hover:scale-[1.01] animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="bg-gradient-primary p-3 rounded-xl shrink-0">
                          <FileText className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="professional-heading text-xl mb-2 truncate">
                            {doc.file_name}
                          </h3>
                          {doc.description && (
                            <p className="banking-text text-muted-foreground mb-3 line-clamp-2">
                              {doc.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground banking-text">
                            <span className="flex items-center gap-1">
                              <span className="font-semibold">Size:</span> {formatFileSize(doc.file_size)}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-semibold">Uploaded:</span> {formatDate(doc.uploaded_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          className="hover:bg-primary hover:text-primary-foreground transition-all rounded-lg border-border/60"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(doc)}
                          className="hover:bg-accent hover:text-accent-foreground transition-all rounded-lg border-border/60"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(doc)}
                          className="hover:bg-destructive hover:text-destructive-foreground transition-all rounded-lg border-border/60"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingDoc} onOpenChange={() => setEditingDoc(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-2xl border-border/60 shadow-premium rounded-2xl">
          <DialogHeader>
            <DialogTitle className="professional-heading text-2xl">Edit Description</DialogTitle>
            <DialogDescription className="banking-text">
              Update the description for {editingDoc?.file_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add a description..."
              className="banking-text border-2 border-border/60 rounded-xl min-h-[120px] resize-none hover:border-primary/50 transition-all"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingDoc(null)}
              className="rounded-xl border-border/60"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDescription}
              className="bg-gradient-primary hover:shadow-elegant text-primary-foreground rounded-xl"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmitDocument;