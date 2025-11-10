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

interface ExpandedMessages {
  [key: string]: boolean;
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
  const [expandedMessages, setExpandedMessages] = useState<ExpandedMessages>({});
  const [showStats, setShowStats] = useState(false);
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

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);
  const messagesByAuthor = messages.reduce((acc, msg) => {
    acc[msg.author] = (acc[msg.author] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
            Member Important Conversations
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
                  {events.length > 0 && (
                    <Badge variant="outline" className="ml-auto">
                      {events.length} events
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedImport ? (
                  <ScrollArea className="h-[600px]">
                    {events.length > 0 ? (
                      events.map((event) => (
                        <Card 
                          key={event.id}
                          className={`mb-4 cursor-pointer transition-all hover:shadow-lg ${
                            selectedEvent === event.id 
                              ? 'ring-2 ring-primary shadow-elegant bg-primary/5' 
                              : 'hover:bg-secondary/50'
                          }`}
                          onClick={() => handleSelectEvent(event.id)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <CardTitle className="text-lg truncate">{event.title}</CardTitle>
                                  {selectedEvent === event.id && (
                                    <ChevronRight className="h-5 w-5 text-primary animate-pulse" />
                                  )}
                                </div>
                                <CardDescription className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {new Date(event.start_datetime).toLocaleString()}
                                </CardDescription>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
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
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Badge variant="secondary" className="font-medium">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                {event.message_count} messages
                              </Badge>
                              {event.keywords.slice(0, 3).map((kw) => (
                                <Badge key={kw} variant="outline">{kw}</Badge>
                              ))}
                              {event.keywords.length > 3 && (
                                <Badge variant="outline">+{event.keywords.length - 3}</Badge>
                              )}
                            </div>
                          </CardHeader>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No events detected in this import</p>
                      </div>
                    )}
                  </ScrollArea>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select an import to view events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Messages Viewer */}
        {selectedEvent && selectedEventData && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {selectedEventData.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {filteredMessages.length} of {messages.length} messages
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                >
                  {showStats ? 'Hide Stats' : 'Show Stats'}
                </Button>
              </div>

              {showStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <div className="text-xs text-muted-foreground">Total Messages</div>
                    <div className="text-2xl font-bold">{messages.length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Participants</div>
                    <div className="text-2xl font-bold">{uniqueAuthors.length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Date Range</div>
                    <div className="text-sm font-medium">
                      {messages.length > 0 && (
                        <>
                          {new Date(messages[0].datetime_iso).toLocaleDateString()} - 
                          {new Date(messages[messages.length - 1].datetime_iso).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Top Contributor</div>
                    <div className="text-sm font-medium truncate">
                      {Object.entries(messagesByAuthor).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
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
                  <SelectTrigger className="w-full sm:w-[200px]">
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
              <ScrollArea className="h-[500px] pr-4">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((msg, idx) => {
                    const isLongMessage = msg.text.length > 200;
                    const isExpanded = expandedMessages[msg.id];
                    const displayText = isLongMessage && !isExpanded 
                      ? msg.text.substring(0, 200) + '...' 
                      : msg.text;

                    return (
                      <div 
                        key={msg.id} 
                        className="mb-3 p-4 bg-secondary/80 hover:bg-secondary rounded-lg transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-semibold text-sm">{msg.author}</span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(msg.datetime_iso).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyMessage(msg.text)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-sm whitespace-pre-wrap leading-relaxed mb-2">
                          {displayText}
                        </p>
                        
                        {isLongMessage && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => toggleMessageExpansion(msg.id)}
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </Button>
                        )}
                        
                        {msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {msg.attachments.map((att, i) => (
                              <Badge key={i} variant="outline" className="gap-1">
                                <FileText className="h-3 w-3" />
                                {att}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages match your filters</p>
                  </div>
                )}
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