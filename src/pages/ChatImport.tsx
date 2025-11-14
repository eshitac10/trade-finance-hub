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
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, FileText, Clock, Users, Tag, Calendar, 
  Download, Edit2, Trash2, Merge, Split, Search,
  AlertCircle, ChevronRight, MessageSquare, Filter, Copy,
  TrendingUp, Activity, BarChart3, Sparkles
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
  year?: number;
  month?: number;
  week?: number;
}

interface MessageGroup {
  year: number;
  month: number;
  label: string;
  count: number;
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
  const [summary, setSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  // Monthly chunk states
  const [monthlyChunks, setMonthlyChunks] = useState<Array<{year: number; month: number; label: string; count: number}>>([]);
  const [selectedChunk, setSelectedChunk] = useState<{year: number; month: number} | null>(null);
  const [chunkingFile, setChunkingFile] = useState(false);
  
  // New state for enhanced features
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [groupBy, setGroupBy] = useState<'none' | 'year' | 'month' | 'week'>('none');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date');
  
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
      return [] as WhatsAppEvent[];
    } else {
      setEvents(data || []);
      return (data || []) as WhatsAppEvent[];
    }
  };

  const fetchMessages = async (eventId: string, page = 0, pageSize = 100) => {
    if (page === 0) {
      setMessages([]); // Clear only on first page
      setSummary(""); // Clear previous summary
    }
    
    console.log('Fetching messages for event:', eventId, 'page:', page);
    
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact' })
      .eq('event_id', eventId)
      .order('datetime_iso', { ascending: false }) // Newest first
      .range(from, to);

    if (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } else {
      console.log('Fetched messages:', data?.length, 'Total count:', count);
      
      // Add year, month, week to each message
      const enrichedMessages = (data || []).map(msg => {
        const date = new Date(msg.datetime_iso);
        return {
          ...msg,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          week: Math.ceil(date.getDate() / 7)
        };
      });
      
      if (page === 0) {
        setMessages(enrichedMessages);
      } else {
        setMessages(prev => [...prev, ...enrichedMessages]);
      }
    }
  };

  // Fallback: fetch recent messages for an import when no events are detected
  const fetchMessagesByImport = async (importId: string, page = 0, pageSize = 100) => {
    if (page === 0) {
      setMessages([]);
      setSummary("");
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact' })
      .eq('import_id', importId)
      .order('datetime_iso', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching messages by import:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
      return;
    }

    const enrichedMessages = (data || []).map(msg => {
      const date = new Date(msg.datetime_iso);
      return {
        ...msg,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        week: Math.ceil(date.getDate() / 7)
      };
    });

    if (page === 0) {
      setMessages(enrichedMessages);
    } else {
      setMessages(prev => [...prev, ...enrichedMessages]);
    }
  };

  const generateSummary = async (length: 'short' | 'medium' | 'long' = summaryLength, messageSubset?: WhatsAppMessage[]) => {
    const msgsToSummarize = messageSubset || filteredMessages;
    
    if (!msgsToSummarize.length) {
      toast({
        title: "No Messages",
        description: "Please select a conversation or date range first",
        variant: "destructive",
      });
      return;
    }

    setLoadingSummary(true);
    try {
      // Limit to 1000 messages to avoid timeout
      const messagesToSummarize = msgsToSummarize.slice(0, 1000);
      
      console.log(`Generating ${length} summary for ${messagesToSummarize.length} of ${msgsToSummarize.length} messages`);
      
      const systemPrompts = {
        short: "Create a very brief 1-2 line summary highlighting the main topic and key outcome.",
        medium: "Create a 3-5 bullet point summary covering key topics, decisions, and action items. Include main participants.",
        long: "Create a detailed 150-250 word summary. Include: main topics discussed, key decisions made, action items identified, important participants, relevant dates, and any concerns or follow-ups. Structure it clearly."
      };
      
      const { data, error } = await supabase.functions.invoke('summarize-conversation', {
        body: { 
          messages: messagesToSummarize,
          summaryType: length,
          systemPrompt: systemPrompts[length]
        }
      });

      if (error) throw error;

      setSummary(data.summary);
      toast({
        title: "Summary Generated",
        description: msgsToSummarize.length > 1000 
          ? `${length.charAt(0).toUpperCase() + length.slice(1)} summary from first 1000 of ${msgsToSummarize.length} messages`
          : `${length.charAt(0).toUpperCase() + length.slice(1)} summary generated successfully`,
      });
    } catch (error: any) {
      console.error('Summary error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setLoadingSummary(false);
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

    setFile(selectedFile);

    // Chunk large files (> 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      await chunkFile(selectedFile);
    }

    // Show sample preview for text files
    if (selectedFile.name.endsWith('.txt')) {
      try {
        const text = await selectedFile.text();
        const lines = text.split('\n').slice(0, 20);
        setSampleLines(lines);
        setShowSamplePreview(true);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  };

  const chunkFile = async (file: File) => {
    setChunkingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('chunk-whatsapp', {
        body: formData as any,
      });

      if (error) throw error;

      if (data?.chunks) {
        setMonthlyChunks(data.chunks);
        toast({
          title: "File chunked successfully",
          description: `Found ${data.chunks.length} monthly chunks with ${data.totalMessages} total messages`,
        });
      }
    } catch (error: any) {
      console.error('Chunking error:', error);
      toast({
        title: "Chunking failed",
        description: error.message || "Failed to chunk file",
        variant: "destructive",
      });
    } finally {
      setChunkingFile(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // Check file size (1GB max)
    const maxSize = 1024 * 1024 * 1024; // 1GB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 1GB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('timezone', timezone);

      console.log('Uploading file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

      // Use built-in invoke to handle auth and headers properly
      const { data: result, error: invokeError } = await supabase.functions.invoke('parse-whatsapp', {
        body: formData as any,
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Upload failed');
      }

      // If the function responds immediately and continues processing, poll for completion
      const importId: string | undefined = (result as any)?.importId;

      // Helper: poll import status until completed (max ~60s)
      const pollImportStatus = async (id: string) => {
        const start = Date.now();
        let lastStatus = 'processing';
        while (Date.now() - start < 60000) { // 60s max
          const { data: imp, error } = await supabase
            .from('whatsapp_imports')
            .select('status, total_messages')
            .eq('id', id)
            .single();
          if (error) break;
          if (imp) lastStatus = imp.status;
          if (imp?.status === 'completed') return true;
          await new Promise(r => setTimeout(r, 2000));
        }
        console.warn('Polling timed out. Last status:', lastStatus);
        return false;
      };

      if (importId) {
        const done = await pollImportStatus(importId);
        if (!done) {
          toast({
            title: 'Still processing',
            description: 'We will load events as soon as processing completes.',
          });
        }
      }

      toast({
        title: 'Upload started',
        description: importId
          ? `Import ${importId.slice(0, 8)}… ready. Loading events…`
          : 'Processing complete.',
      });

      setFile(null);
      setShowSamplePreview(false);

      // Refresh imports list and auto-select the latest/current import
      await fetchImports();
      if (importId) {
        setSelectedImport(importId);
        // Fetch events for this import and auto-select the newest one
        const { data: evts } = await supabase
          .from('whatsapp_events')
          .select('*')
          .eq('import_id', importId)
          .order('start_datetime', { ascending: false });
        setEvents(evts || []);
        if (evts && evts.length > 0) {
          const first = evts[0];
          setSelectedEvent(first.id);
          await fetchMessages(first.id);
        } else {
          // No events detected for this import; load recent messages directly
          await fetchMessagesByImport(importId);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const handleSelectImport = async (importId: string) => {
    setSelectedImport(importId);
    setSelectedEvent(null);
    setMessages([]);
    const evts = await fetchEvents(importId);
    if (!evts || evts.length === 0) {
      // No events detected, load messages directly by import as a fallback
      await fetchMessagesByImport(importId);
    }
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvent(eventId);
    fetchMessages(eventId);
  };

  const handleDeleteImport = async (importId: string) => {
    if (!confirm("Delete this failed import? You can then re-upload the file with the fixed parser.")) return;
    
    const { error } = await supabase
      .from('whatsapp_imports')
      .delete()
      .eq('id', importId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete import",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Import deleted. Re-upload your file to process it with the fixed parser."
      });
      if (selectedImport === importId) {
        setSelectedImport(null);
        setSelectedEvent(null);
        setMessages([]);
      }
      fetchImports();
    }
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

  // Apply filters
  const getFilteredMessagesByDate = () => {
    const now = new Date();
    let filtered = messages;
    
    switch (dateFilter) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = messages.filter(m => new Date(m.datetime_iso) >= today);
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = messages.filter(m => new Date(m.datetime_iso) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = messages.filter(m => new Date(m.datetime_iso) >= monthAgo);
        break;
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          const start = new Date(customDateRange.start);
          const end = new Date(customDateRange.end);
          filtered = messages.filter(m => {
            const msgDate = new Date(m.datetime_iso);
            return msgDate >= start && msgDate <= end;
          });
        }
        break;
    }
    
    return filtered;
  };

  const filteredMessages = getFilteredMessagesByDate().filter(m => {
    const matchesSearch = searchTerm === '' || 
      m.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuthor = filterAuthor === 'all' || m.author === filterAuthor;
    return matchesSearch && matchesAuthor;
  });
  
  // Group messages by time period
  const getGroupedMessages = () => {
    if (groupBy === 'none') return null;
    
    const groups: Record<string, WhatsAppMessage[]> = {};
    
    filteredMessages.forEach(msg => {
      let key = '';
      const date = new Date(msg.datetime_iso);
      
      switch (groupBy) {
        case 'year':
          key = date.getFullYear().toString();
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'week':
          const weekNum = Math.ceil(date.getDate() / 7);
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${weekNum}`;
          break;
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(msg);
    });
    
    return groups;
  };

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
    <div className="min-h-screen bg-background dark:bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 dark:bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-primary opacity-5 dark:opacity-10 rounded-full blur-3xl"></div>
      </div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-primary/10 rounded-full mb-6 animate-scale-in">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">
              AI-Powered Conversation Analysis
            </span>
          </div>
          <h1 className="professional-heading text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Member Important Conversations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload WhatsApp chats and automatically extract key events and conversations with intelligent AI analysis
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 bg-card dark:bg-card backdrop-blur-xl border-border/60 shadow-elegant hover:shadow-premium transition-all duration-500 animate-scale-in rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 dark:opacity-10"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <Upload className="h-6 w-6 text-primary-foreground" />
              </div>
              Upload Chat Export
            </CardTitle>
            <CardDescription className="text-base">
              Drag and drop your WhatsApp .txt or .zip file (max 1 GB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="file" className="text-base font-semibold">Choose File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".txt,.zip"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="h-12 border-2 border-dashed hover:border-primary transition-all cursor-pointer"
                />
              </div>

              {file && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20 animate-fade-in">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              {/* Monthly Chunks Selection */}
              {monthlyChunks.length > 0 && (
                <div className="space-y-3 p-4 bg-accent/5 rounded-xl border border-accent/20">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Split className="h-4 w-4" />
                    Select Month to Process
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {monthlyChunks.map((chunk, idx) => (
                      <Button
                        key={idx}
                        variant={selectedChunk?.year === chunk.year && selectedChunk?.month === chunk.month ? "default" : "outline"}
                        onClick={() => setSelectedChunk({ year: chunk.year, month: chunk.month })}
                        className="justify-between"
                        size="sm"
                      >
                        <span>{chunk.label}</span>
                        <Badge variant="secondary" className="ml-2">{chunk.count}</Badge>
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedChunk ? `${monthlyChunks.find(c => c.year === selectedChunk.year && c.month === selectedChunk.month)?.label} (${monthlyChunks.find(c => c.year === selectedChunk.year && c.month === selectedChunk.month)?.count} messages)` : 'None'}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-base font-semibold">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone" className="h-12">
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
                disabled={!file || uploading || (monthlyChunks.length > 0 && !selectedChunk)}
                className="w-full h-12 text-base bg-gradient-primary hover:shadow-accent font-semibold rounded-xl"
              >
                {processing ? (
                  <>
                    <CreativeLoader size="sm" className="mr-2" />
                    Processing with AI...
                  </>
                ) : chunkingFile ? (
                  <>
                    <CreativeLoader size="sm" className="mr-2" />
                    Chunking file...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    {monthlyChunks.length > 0 ? 'Process Selected Month' : 'Process File'}
                  </>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="lg:col-span-1 bg-card dark:bg-card backdrop-blur-xl border-border/60 shadow-elegant hover:shadow-premium transition-all duration-500 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <FileText className="h-5 w-5 text-primary-foreground" />
                  </div>
                  Imported Chats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {imports.map((imp, idx) => (
                    <Card
                      key={imp.id}
                      className={`mb-3 p-4 cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 border-2 relative group ${
                        selectedImport === imp.id 
                          ? 'border-primary bg-primary/5 shadow-accent' 
                          : imp.total_messages === 0
                          ? 'border-destructive/50 bg-destructive/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleSelectImport(imp.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-semibold pr-8 break-words flex-1">{imp.filename}</div>
                        {imp.total_messages === 0 && (
                          <Badge variant="destructive" className="text-xs shrink-0">
                            Failed
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {imp.total_messages} messages
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(imp.upload_date), { addSuffix: true })}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImport(imp.id);
                        }}
                        title={imp.total_messages === 0 ? "Delete failed import & re-upload" : "Delete import"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </Card>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Events Timeline */}
            <Card className="lg:col-span-2 bg-card dark:bg-card backdrop-blur-xl border-border/60 shadow-elegant hover:shadow-premium transition-all duration-500 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10 pointer-events-none"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <Activity className="h-5 w-5 text-primary-foreground" />
                  </div>
                  Events Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {selectedImport ? (
                  <ScrollArea className="h-[400px] pr-4">
                    {events.length > 0 ? (
                      events.map((event, idx) => (
                        <Card
                          key={event.id}
                          onClick={() => handleSelectEvent(event.id)}
                          className={`mb-4 p-5 cursor-pointer transition-all duration-300 hover:shadow-premium hover:-translate-y-1 group border-2 ${
                            selectedEvent === event.id
                              ? 'border-accent bg-gradient-to-r from-primary/10 to-accent/10 shadow-accent'
                              : 'border-border hover:border-accent/50 bg-card/50 backdrop-blur-sm'
                          }`}
                        >
                          <CardHeader className="p-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-2 bg-gradient-primary rounded-lg">
                                    <Calendar className="h-4 w-4 text-primary-foreground" />
                                  </div>
                                  <CardTitle className="text-base group-hover:text-accent transition-colors line-clamp-1">
                                    {event.title.length > 50 ? event.title.substring(0, 50) + '...' : event.title}
                                  </CardTitle>
                                </div>
                                <CardDescription className="flex items-center gap-2 text-sm">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(event.start_datetime).toLocaleString()}
                                </CardDescription>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingEvent(event);
                                    setNewEventTitle(event.title);
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
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
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
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
                                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                              <Badge variant="secondary" className="font-medium px-3 py-1 bg-primary/10 hover:bg-primary/20 transition-colors">
                                <MessageSquare className="h-3 w-3 mr-1.5" />
                                {event.message_count} messages
                              </Badge>
                              {event.keywords.slice(0, 3).map((kw) => (
                                <Badge key={kw} variant="outline" className="px-3 py-1 border-primary/30 hover:border-primary transition-colors">
                                  {kw}
                                </Badge>
                              ))}
                              {event.keywords.length > 3 && (
                                <Badge variant="outline" className="border-accent/30">
                                  +{event.keywords.length - 3} more
                                </Badge>
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
          <>
            {/* AI Summary Card */}
            <Card className="mt-8 border-gold/30 shadow-elegant rounded-2xl overflow-hidden animate-fade-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 helvetica-bold">
                    <Sparkles className="h-5 w-5 text-gold" />
                    AI Smart Summary
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select value={summaryLength} onValueChange={(v: 'short' | 'medium' | 'long') => setSummaryLength(v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => generateSummary()}
                      disabled={loadingSummary || messages.length === 0}
                      className="bg-gradient-to-r from-primary via-accent to-gold hover:shadow-gold/50"
                      size="sm"
                    >
                      {loadingSummary ? "Generating..." : "Generate Summary"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingSummary ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                ) : summary ? (
                  <div className="bg-gradient-to-r from-primary/5 via-gold/10 to-accent/5 border border-gold/20 rounded-lg p-4">
                    <p className="text-sm leading-relaxed banking-text">{summary}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic text-center py-4">
                    Click "Generate Summary" to get an AI-powered overview of this conversation
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Messages Card */}
            <Card className="mt-8 bg-card dark:bg-card backdrop-blur-xl border-border/60 shadow-elegant rounded-2xl overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 dark:from-accent/10 dark:to-primary/10 pointer-events-none"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-primary rounded-xl">
                      <MessageSquare className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl helvetica-bold">{selectedEventData.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-2 text-base">
                    {filteredMessages.length} of {messages.length} messages
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                  className="h-10 px-6 border-2 hover:border-primary hover:shadow-accent transition-all"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {showStats ? 'Hide Stats' : 'Show Stats'}
                </Button>
              </div>

              {showStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-6 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-2xl border border-primary/20 animate-scale-in">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Total Messages
                    </div>
                    <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {messages.length}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Users className="h-3.5 w-3.5" />
                      Participants
                    </div>
                    <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {uniqueAuthors.length}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      Date Range
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {messages.length > 0 && (
                        <>
                          {new Date(messages[0].datetime_iso).toLocaleDateString()} - 
                          {new Date(messages[messages.length - 1].datetime_iso).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Activity className="h-3.5 w-3.5" />
                      Top Contributor
                    </div>
                    <div className="text-sm font-semibold text-foreground truncate">
                      {Object.entries(messagesByAuthor).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Advanced Filters */}
              <div className="space-y-4 mt-6 p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-background/50 border-2 focus:border-primary"
                    />
                  </div>
                  <Select value={filterAuthor} onValueChange={setFilterAuthor}>
                    <SelectTrigger className="w-full sm:w-[240px] h-12 border-2">
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
                
                {/* Date Filter & Grouping */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11 border-2">
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
                    <SelectTrigger className="w-full sm:w-[180px] h-11 border-2">
                      <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No grouping</SelectItem>
                      <SelectItem value="year">By Year</SelectItem>
                      <SelectItem value="month">By Month</SelectItem>
                      <SelectItem value="week">By Week</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="w-full sm:w-[180px] h-11 border-2">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date (Newest)</SelectItem>
                      <SelectItem value="relevance">Relevance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Custom Date Range */}
                {dateFilter === 'custom' && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="flex-1">
                      <Label className="text-xs mb-1 block">Start Date</Label>
                      <Input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs mb-1 block">End Date</Label>
                      <Input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                  </div>
                )}
                
                {/* Filter Summary */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {searchTerm && (
                      <Badge variant="secondary" className="font-mono">
                        Search: {searchTerm}
                      </Badge>
                    )}
                    {filterAuthor !== 'all' && (
                      <Badge variant="secondary">
                        Author: {filterAuthor}
                      </Badge>
                    )}
                    {dateFilter !== 'all' && (
                      <Badge variant="secondary">
                        {dateFilter === 'custom' ? `${customDateRange.start} to ${customDateRange.end}` : dateFilter}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterAuthor('all');
                      setDateFilter('all');
                      setCustomDateRange({ start: '', end: '' });
                      setGroupBy('none');
                    }}
                    className="text-xs"
                  >
                    Clear all filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <ScrollArea className="h-[600px] pr-4">
                {filteredMessages.length > 0 ? (
                  <>
                    {/* Grouped View */}
                    {groupBy !== 'none' && (() => {
                      const grouped = getGroupedMessages();
                      if (!grouped) return null;
                      
                      return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0])).map(([key, msgs]) => {
                        const isExpanded = expandedGroups[key] ?? true;
                        const groupDate = new Date(msgs[0].datetime_iso);
                        let groupLabel = '';
                        
                        switch (groupBy) {
                          case 'year':
                            groupLabel = groupDate.getFullYear().toString();
                            break;
                          case 'month':
                            groupLabel = groupDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                            break;
                          case 'week':
                            groupLabel = `Week ${Math.ceil(groupDate.getDate() / 7)} - ${groupDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`;
                            break;
                        }
                        
                        return (
                          <div key={key} className="mb-6 animate-fade-in">
                            <div 
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border-2 border-primary/20 cursor-pointer hover:border-primary/40 transition-all mb-3"
                              onClick={() => setExpandedGroups(prev => ({ ...prev, [key]: !isExpanded }))}
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-primary" />
                                <h3 className="font-bold text-lg">{groupLabel}</h3>
                                <Badge variant="secondary" className="ml-2">
                                  {msgs.length} messages
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    generateSummary(summaryLength, msgs);
                                  }}
                                  className="h-8 text-xs"
                                >
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Summarize
                                </Button>
                                <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="space-y-3 ml-4 pl-4 border-l-2 border-primary/20">
                                {msgs.map((msg, idx) => {
                                  const isLongMessage = msg.text.length > 200;
                                  const isMsgExpanded = expandedMessages[msg.id];
                                  const displayText = isLongMessage && !isMsgExpanded 
                                    ? msg.text.substring(0, 200) + '...' 
                                    : msg.text;

                                  return (
                                    <div 
                                      key={msg.id} 
                                      className="p-4 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm hover:from-primary/5 hover:to-accent/5 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 group hover:shadow-elegant"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-sm">
                                            <Users className="h-4 w-4 text-primary-foreground" />
                                          </div>
                                          <div>
                                            <span className="font-semibold text-sm">{msg.author}</span>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                              <Clock className="h-3 w-3" />
                                              {new Date(msg.datetime_iso).toLocaleString()}
                                            </div>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="opacity-0 group-hover:opacity-100 transition-all h-7 w-7 p-0 hover:bg-primary/10"
                                          onClick={() => copyMessage(msg.text)}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      
                                      <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
                                        {displayText}
                                      </p>
                                      
                                      {isLongMessage && (
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="h-auto p-0 text-xs font-semibold hover:text-primary mt-2"
                                          onClick={() => toggleMessageExpansion(msg.id)}
                                        >
                                          {isMsgExpanded ? '← Show less' : 'Show more →'}
                                        </Button>
                                      )}
                                      
                                      {msg.attachments?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {msg.attachments.map((att, i) => (
                                            <Badge key={i} variant="outline" className="gap-1 text-xs">
                                              <FileText className="h-2.5 w-2.5" />
                                              {att}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                    
                    {/* List View (no grouping) */}
                    {groupBy === 'none' && filteredMessages.map((msg, idx) => {
                      const isLongMessage = msg.text.length > 200;
                      const isExpanded = expandedMessages[msg.id];
                      const displayText = isLongMessage && !isExpanded 
                        ? msg.text.substring(0, 200) + '...' 
                        : msg.text;

                      return (
                        <div 
                          key={msg.id} 
                          className="mb-4 p-5 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm hover:from-primary/5 hover:to-accent/5 rounded-xl border-2 border-border hover:border-primary/30 transition-all duration-300 group hover:shadow-elegant animate-fade-in"
                          style={{ animationDelay: `${idx * 0.02}s` }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
                                <Users className="h-5 w-5 text-primary-foreground" />
                              </div>
                              <div>
                                <span className="font-semibold text-base">{msg.author}</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(msg.datetime_iso).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-all h-9 w-9 p-0 hover:bg-primary/10 hover:scale-110"
                              onClick={() => copyMessage(msg.text)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <p className="text-sm whitespace-pre-wrap leading-relaxed mb-3 text-foreground/90">
                            {displayText}
                          </p>
                          
                          {isLongMessage && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs font-semibold hover:text-primary"
                              onClick={() => toggleMessageExpansion(msg.id)}
                            >
                              {isExpanded ? '← Show less' : 'Show more →'}
                            </Button>
                          )}
                          
                          {msg.attachments?.length > 0 && (
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
                    })}
                    
                    {/* Empty State for filters */}
                    {filteredMessages.length === 0 && messages.length > 0 && (
                      <div className="text-center text-muted-foreground py-12">
                        <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-semibold mb-2">No messages match your filters</p>
                        <p className="text-sm">Try adjusting your search or date range</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => {
                            setSearchTerm('');
                            setFilterAuthor('all');
                            setDateFilter('all');
                          }}
                        >
                          Clear all filters
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-semibold mb-2">No messages found</p>
                    <p className="text-sm">This event doesn't have any messages yet</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
          </>
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