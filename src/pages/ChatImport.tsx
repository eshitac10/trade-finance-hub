import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, FileText, Clock, Users, Tag, Calendar, 
  Download, Edit2, Trash2, Merge, Split, Search,
  AlertCircle, ChevronRight, MessageSquare, Filter
} from 'lucide-react';
import CreativeLoader from '@/components/CreativeLoader';
import { formatDistanceToNow } from 'date-fns';

interface WhatsAppImport {
  id: string;
  filename: string;
  file_size: number;
  upload_date: string;
  total_messages: number;
  status: string;
}

interface WhatsAppEvent {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  message_count: number;
  keywords: string[];
  tags: string[];
  confidence_score: number;
}

interface WhatsAppMessage {
  id: string;
  datetime_iso: string;
  author: string;
  text: string;
  attachments: string[];
}

const ChatImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imports, setImports] = useState<WhatsAppImport[]>([]);
  const [selectedImport, setSelectedImport] = useState<string | null>(null);
  const [events, setEvents] = useState<WhatsAppEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState('UTC');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [editingEvent, setEditingEvent] = useState<WhatsAppEvent | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [showSamplePreview, setShowSamplePreview] = useState(false);
  const [sampleLines, setSampleLines] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    fetchImports();
  };

  const fetchImports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('whatsapp_imports')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load imports",
        variant: "destructive"
      });
    } else {
      setImports(data || []);
    }
    setLoading(false);
  };

  const fetchEvents = async (importId: string) => {
    const { data, error } = await supabase
      .from('whatsapp_events')
      .select('*')
      .eq('import_id', importId)
      .order('start_datetime', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } else {
      setEvents(data || []);
    }
  };

  const fetchMessages = async (eventId: string) => {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('event_id', eventId)
      .order('datetime_iso', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } else {
      setMessages(data || []);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.txt') && !selectedFile.name.endsWith('.zip')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .zip file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50 MB",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);

    // Show sample preview
    const text = await selectedFile.text();
    const lines = text.split('\n').slice(0, 20);
    setSampleLines(lines);
    setShowSamplePreview(true);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('timezone', timezone);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-whatsapp`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast({
        title: "Success!",
        description: `Processed ${result.totalMessages} messages and detected ${result.eventsDetected} events`,
      });

      setFile(null);
      setShowSamplePreview(false);
      fetchImports();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const handleSelectImport = (importId: string) => {
    setSelectedImport(importId);
    setSelectedEvent(null);
    setMessages([]);
    fetchEvents(importId);
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvent(eventId);
    fetchMessages(eventId);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('whatsapp_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Deleted",
        description: "Event deleted successfully",
      });
      if (selectedImport) fetchEvents(selectedImport);
      setSelectedEvent(null);
      setMessages([]);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !newEventTitle) return;

    const { error } = await supabase
      .from('whatsapp_events')
      .update({ title: newEventTitle })
      .eq('id', editingEvent.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Updated",
        description: "Event renamed successfully",
      });
      if (selectedImport) fetchEvents(selectedImport);
      setEditingEvent(null);
      setNewEventTitle('');
    }
  };

  const handleExportEvent = (event: WhatsAppEvent, format: 'json' | 'csv') => {
    const eventMessages = messages.filter(m => m.id);
    
    if (format === 'json') {
      const json = JSON.stringify({ event, messages: eventMessages }, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.json`;
      a.click();
    } else {
      const csv = [
        'Timestamp,Author,Message',
        ...eventMessages.map(m => 
          `"${m.datetime_iso}","${m.author}","${m.text.replace(/"/g, '""')}"`
        )
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
      a.click();
    }

    toast({
      title: "Exported",
      description: `Event exported as ${format.toUpperCase()}`,
    });
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = searchTerm === '' || 
      m.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuthor = filterAuthor === 'all' || m.author === filterAuthor;
    return matchesSearch && matchesAuthor;
  });

  const uniqueAuthors = [...new Set(messages.map(m => m.author))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <CreativeLoader size="lg" text="Loading..." className="min-h-[500px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="professional-heading text-4xl font-bold mb-4">
            Chat Import → Smart Timeline
          </h1>
          <p className="text-muted-foreground">
            Upload WhatsApp chat exports and organize them into searchable events
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Chat Export
            </CardTitle>
            <CardDescription>
              Drag and drop your WhatsApp .txt or .zip file (max 50 MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="file">Choose File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".txt,.zip"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>

              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Kolkata">India</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className="w-full"
              >
                {processing ? (
                  <>
                    <CreativeLoader size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Process File'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sample Preview Dialog */}
        <Dialog open={showSamplePreview} onOpenChange={setShowSamplePreview}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sample Preview</DialogTitle>
              <DialogDescription>
                First 20 lines of your chat file
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              {sampleLines.map((line, i) => (
                <div key={i} className="text-sm font-mono mb-1">{line}</div>
              ))}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Imports List & Timeline */}
        {imports.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Imports Sidebar */}
            <Card>
              <CardHeader>
                <CardTitle>Your Imports</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {imports.map((imp) => (
                    <button
                      key={imp.id}
                      onClick={() => handleSelectImport(imp.id)}
                      className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                        selectedImport === imp.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      <div className="font-medium truncate">{imp.filename}</div>
                      <div className="text-sm opacity-80">
                        {imp.total_messages} messages
                      </div>
                      <div className="text-xs opacity-60">
                        {formatDistanceToNow(new Date(imp.upload_date), { addSuffix: true })}
                      </div>
                    </button>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Events Timeline */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Events Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedImport ? (
                  <ScrollArea className="h-[600px]">
                    {events.map((event) => (
                      <Card 
                        key={event.id}
                        className={`mb-4 cursor-pointer transition-all ${
                          selectedEvent === event.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleSelectEvent(event.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3" />
                                {new Date(event.start_datetime).toLocaleString()}
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingEvent(event);
                                  setNewEventTitle(event.title);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportEvent(event, 'json');
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {event.message_count} messages
                            </Badge>
                            {event.keywords.map((kw) => (
                              <Badge key={kw} variant="outline">{kw}</Badge>
                            ))}
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </ScrollArea>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select an import to view events
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Messages Viewer */}
        {selectedEvent && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </CardTitle>
              <div className="flex gap-2 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterAuthor} onValueChange={setFilterAuthor}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All authors</SelectItem>
                    {uniqueAuthors.map((author) => (
                      <SelectItem key={author} value={author}>{author}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {filteredMessages.map((msg) => (
                  <div key={msg.id} className="mb-4 p-3 bg-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{msg.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.datetime_iso).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.attachments.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {msg.attachments.map((att, i) => (
                          <Badge key={i} variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            {att}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Edit Event Dialog */}
        <Dialog open={editingEvent !== null} onOpenChange={() => setEditingEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="event-title">Event Title</Label>
                <Input
                  id="event-title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                />
              </div>
              <Button onClick={handleUpdateEvent} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ChatImport;