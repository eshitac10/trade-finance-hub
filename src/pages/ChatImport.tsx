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
  TrendingUp, Activity, BarChart3, Sparkles, X
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
  const [splittingFile, setSplittingFile] = useState(false);
  const [yearlyChunks, setYearlyChunks] = useState<Array<{year: number; messages: string[]; size: number}>>([]);
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
  
  // Multiple delete states
  const [selectedImports, setSelectedImports] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
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
  
  // Edit and delete states
  const [editingImport, setEditingImport] = useState<WhatsAppImport | null>(null);
  const [newFilename, setNewFilename] = useState('');
  const [deletingImport, setDeletingImport] = useState<WhatsAppImport | null>(null);
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && mounted) {
          navigate('/auth');
          return;
        }
        
        if (session && mounted) {
          await fetchImports();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setLoading(false);
        }
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

  const fetchImports = async () => {
    setLoading(true);
    try {
      // OPTIMIZED: Minimal columns, smaller limit
      const { data, error } = await supabase
        .from('whatsapp_imports')
        .select('id, filename, file_size, upload_date, total_messages, status')
        .order('upload_date', { ascending: false })
        .limit(50); // Reduced from 100

      if (error) {
        console.error('Error fetching imports:', error);
        setImports([]);
      } else {
        setImports(data || []);
      }
    } catch (error) {
      console.error('Error in fetchImports:', error);
      setImports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (importId: string) => {
    // Optimize query - reduced limit for faster initial load
    const { data, error } = await supabase
      .from('whatsapp_events')
      .select('id, title, start_datetime, end_datetime, message_count, keywords, tags, confidence_score')
      .eq('import_id', importId)
      .order('start_datetime', { ascending: false })
      .limit(20); // Reduced from 50 for faster loading

    if (error) {
      console.error('Error loading events:', error);
      setEvents([]);
      return [] as WhatsAppEvent[];
    } else {
      setEvents(data || []);
      return (data || []) as WhatsAppEvent[];
    }
  };

  const fetchMessages = async (eventId: string, page = 0, pageSize = 30) => {
    if (page === 0) {
      setMessages([]);
      setSummary("");
    }
    
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    // OPTIMIZED: Smaller page size, minimal columns
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('id, datetime_iso, author, text')
      .eq('event_id', eventId)
      .order('datetime_iso', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }
    
    const enrichedMessages = (data || []).map(msg => {
      const date = new Date(msg.datetime_iso);
      return {
        ...msg,
        attachments: [], // Skip for performance
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

  // Fallback: fetch recent messages for an import when no events are detected
  const fetchMessagesByImport = async (importId: string, page = 0, pageSize = 50) => {
    if (page === 0) {
      setMessages([]);
      setSummary("");
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    // Optimize query with only needed columns
    const { data, error, count } = await supabase
      .from('whatsapp_messages')
      .select('id, datetime_iso, author, text, attachments', { count: 'exact' })
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
    setYearlyChunks([]); // Reset yearly chunks when new file is selected

    // Split large files into yearly chunks (over 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      await splitFileIntoYears(selectedFile);
    } else {
      // Show sample preview for small text files
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
    }
  };

  const splitFileIntoYears = async (file: File) => {
    setSplittingFile(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      // WhatsApp date formats: DD/MM/YY or DD/MM/YYYY
      const dateRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4})/;
      const yearGroups: Record<number, string[]> = {};
      
      for (const line of lines) {
        const match = line.match(dateRegex);
        if (match) {
          const datePart = match[1];
          const parts = datePart.split('/');
          let year = parseInt(parts[2]);
          
          // Convert 2-digit year to 4-digit
          if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year;
          }
          
          if (!yearGroups[year]) {
            yearGroups[year] = [];
          }
          yearGroups[year].push(line);
        } else if (Object.keys(yearGroups).length > 0) {
          // Continuation of previous message
          const lastYear = Math.max(...Object.keys(yearGroups).map(Number));
          yearGroups[lastYear].push(line);
        }
      }
      
      const chunks = Object.entries(yearGroups)
        .map(([year, messages]) => ({
          year: parseInt(year),
          messages,
          size: messages.join('\n').length
        }))
        .sort((a, b) => a.year - b.year);
      
      setYearlyChunks(chunks);
      
      toast({
        title: "File split successfully",
        description: `Split into ${chunks.length} yearly files (${chunks.map(c => c.year).join(', ')})`,
      });
    } catch (error: any) {
      console.error('Splitting error:', error);
      toast({
        title: "Splitting failed",
        description: error.message || "Failed to split file into years",
        variant: "destructive",
      });
    } finally {
      setSplittingFile(false);
    }
  };

  const downloadYearlyChunk = (year: number) => {
    const chunk = yearlyChunks.find(c => c.year === year);
    if (!chunk) return;
    
    const content = chunk.messages.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WhatsApp_Chat_${year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `Download complete! Now upload ${year} chat to process it (${(chunk.size / 1024).toFixed(1)} KB)`,
    });
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

      // Prepare multipart form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timezone', timezone);

      console.log('Uploading file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

      let importId: string | undefined;

      // Attempt 1: multipart upload via invoke (preferred)
      try {
        const { data: result, error: invokeError } = await supabase.functions.invoke('parse-whatsapp', {
          body: formData as any,
        });
        if (invokeError) throw invokeError;
        importId = (result as any)?.importId;
      } catch (err) {
        console.warn('Multipart upload failed, falling back to JSON upload:', err);
        // Attempt 2: JSON upload with raw text (compatible with large files)
        const fileText = await file.text();
        const { data: result2, error: jsonError } = await supabase.functions.invoke('parse-whatsapp', {
          body: {
            fileContent: fileText,
            filename: file.name,
            timezone,
          },
        });
        if (jsonError) throw jsonError;
        importId = (result2 as any)?.importId;
      }

      // Enhanced polling with better feedback
      const pollImportStatus = async (id: string) => {
        const start = Date.now();
        const timeout = 180000; // 3 minutes max polling
        let attempts = 0;
        
        while (Date.now() - start < timeout) {
          attempts++;
          
          const { data: imp, error } = await supabase
            .from('whatsapp_imports')
            .select('status, total_messages')
            .eq('id', id)
            .single();
            
          if (error) {
            console.error('Error polling status:', error);
            return { success: false, error: 'Database error' };
          }
          
          console.log(`Poll attempt ${attempts}: status=${imp?.status}, messages=${imp?.total_messages}`);
          
          // Check if completed
          if (imp?.status === 'completed') {
            // Double-check we have messages
            const { count } = await supabase
              .from('whatsapp_messages')
              .select('*', { count: 'exact', head: true })
              .eq('import_id', id);
              
            if (count && count > 0) {
              return { success: true, messages: count };
            }
          }
          
          if (imp?.status === 'failed') {
            return { success: false, error: 'Processing failed' };
          }
          
          // Wait 3 seconds before next poll
          await new Promise(r => setTimeout(r, 3000));
        }
        
        // Check one final time after timeout
        const { data: finalCheck } = await supabase
          .from('whatsapp_imports')
          .select('status, total_messages')
          .eq('id', id)
          .single();
          
        if (finalCheck?.status === 'completed' && finalCheck?.total_messages > 0) {
          return { success: true, messages: finalCheck.total_messages };
        }
        
        return { success: false, error: 'Processing timeout' };
      };

      if (importId) {
        const result = await pollImportStatus(importId);
        
        if (!result.success) {
          toast({
            title: 'Processing issue',
            description: result.error || 'Please refresh the page to see your imported chats',
            variant: 'destructive',
          });
          setUploading(false);
          setProcessing(false);
          return;
        }

        // Success - clear states and refresh
        setFile(null);
        setShowSamplePreview(false);
        setYearlyChunks([]);

        // Refresh imports list
        await fetchImports();
        
        // Auto-select and load the newly imported data
        setSelectedImport(importId);
        
        // Fetch events for this import
        const { data: evts } = await supabase
          .from('whatsapp_events')
          .select('*')
          .eq('import_id', importId)
          .order('start_datetime', { ascending: false });
          
        if (evts && evts.length > 0) {
          setEvents(evts);
          const firstEvent = evts[0];
          setSelectedEvent(firstEvent.id);
          await fetchMessages(firstEvent.id);
          
          toast({
            title: '✅ Import complete!',
            description: `Found ${evts.length} conversations with ${evts.reduce((sum, e) => sum + (e.message_count || 0), 0)} messages`,
          });
        } else {
          // No events detected, load all messages from this import
          const { data: msgs } = await supabase
            .from('whatsapp_messages')
            .select('*')
            .eq('import_id', importId)
            .order('datetime_iso', { ascending: true })
            .limit(100);
            
          if (msgs && msgs.length > 0) {
            setMessages(msgs);
            toast({
              title: '✅ Import complete!',
              description: `Loaded ${result.messages} messages (showing first 100)`,
            });
          }
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
    setSummary("");
    
    // OPTIMIZATION: Only fetch events, don't auto-load messages
    // User will click on an event to load messages (lazy loading)
    await fetchEvents(importId);
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvent(eventId);
    fetchMessages(eventId);
  };

  const handleDeleteImport = async (importId: string) => {
    try {
      // Delete associated events
      await supabase.from('whatsapp_events').delete().eq('import_id', importId);
      // Delete associated messages
      await supabase.from('whatsapp_messages').delete().eq('import_id', importId);
      // Delete the import itself
      const { error } = await supabase.from('whatsapp_imports').delete().eq('id', importId);

      if (error) throw error;

      toast({
        title: 'Import deleted',
        description: 'Import and all related data removed successfully',
      });

      // Remove from selected imports if it was selected
      setSelectedImports(prev => {
        const newSet = new Set(prev);
        newSet.delete(importId);
        return newSet;
      });

      if (selectedImport === importId) {
        setSelectedImport(null);
        setSelectedEvent(null);
        setMessages([]);
      }
      setDeletingImport(null);
      fetchImports();
    } catch (error: any) {
      toast({
        title: 'Error deleting import',
        description: error.message || 'Failed to delete import',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImports.size === 0) return;

    setBulkDeleting(true);
    try {
      const importIds = Array.from(selectedImports);
      
      // Delete in parallel for speed
      await Promise.all([
        supabase.from('whatsapp_events').delete().in('import_id', importIds),
        supabase.from('whatsapp_messages').delete().in('import_id', importIds),
      ]);
      
      await supabase.from('whatsapp_imports').delete().in('id', importIds);

      toast({
        title: '✅ Bulk delete complete',
        description: `Deleted ${selectedImports.size} import(s) successfully`,
      });

      setSelectedImports(new Set());
      
      if (selectedImport && selectedImports.has(selectedImport)) {
        setSelectedImport(null);
        setEvents([]);
        setMessages([]);
      }
      
      fetchImports();
    } catch (error: any) {
      toast({
        title: 'Error during bulk delete',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectImport = (id: string) => {
    setSelectedImports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedImports.size === imports.length) {
      setSelectedImports(new Set());
    } else {
      setSelectedImports(new Set(imports.map(imp => imp.id)));
    }
  };

  const handleEditImport = async () => {
    if (!editingImport || !newFilename.trim()) return;

    const { error } = await supabase
      .from('whatsapp_imports')
      .update({ filename: newFilename.trim() })
      .eq('id', editingImport.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update filename",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Filename updated successfully",
      });
      setEditingImport(null);
      setNewFilename('');
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <CreativeLoader size="lg" text="Loading..." className="min-h-[500px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-primary opacity-5 rounded-full blur-3xl"></div>
      </div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-primary/10 rounded-full mb-6 animate-scale-in">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">
              AI-Powered Conversation Analysis
            </span>
          </div>
          <h1 className="professional-heading text-5xl md:text-6xl font-bold mb-4 text-foreground">
            Member Conversations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload WhatsApp chats and automatically extract key events and conversations with intelligent AI analysis
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 bg-card backdrop-blur-xl border-border shadow-elegant hover:shadow-premium transition-all duration-500 animate-scale-in rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3 text-2xl text-foreground">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <Upload className="h-6 w-6 text-primary-foreground" />
              </div>
              Upload Chat Export
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Drag and drop your WhatsApp .txt or .zip file (max 1 GB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="file" className="text-base font-semibold text-foreground">Choose File</Label>
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
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              {/* Yearly Chunks Selection */}
              {yearlyChunks.length > 0 && (
                <div className="space-y-4 p-6 bg-gradient-to-br from-accent/10 to-primary/5 rounded-2xl border-2 border-accent/30 animate-fade-in shadow-md">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-bold flex items-center gap-2 text-primary">
                      <Split className="h-5 w-5" />
                      Download Yearly Chunks
                    </Label>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {yearlyChunks.length} years
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Your file is large. Download individual years, then upload each year separately for processing.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {yearlyChunks.map((chunk, idx) => (
                      <Card 
                        key={idx}
                        className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 border-border hover:border-primary/50 animate-scale-in bg-card"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-lg text-primary">{chunk.year}</div>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {chunk.messages.length.toLocaleString()} messages
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(chunk.size / 1024).toFixed(1)} KB
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                            onClick={() => downloadYearlyChunk(chunk.year)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-semibold text-primary mb-1">💡 Next Steps:</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Download the year you want to analyze</li>
                      <li>Upload that downloaded file using the file input above</li>
                      <li>Process and view the categorized conversations</li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-base font-semibold text-foreground">Timezone</Label>
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
                disabled={!file || uploading || yearlyChunks.length > 0}
                className="w-full h-12 text-base bg-gradient-primary hover:shadow-accent font-semibold rounded-xl transition-all"
              >
                {processing ? (
                  <>
                    <CreativeLoader size="sm" className="mr-2" />
                    Processing with AI...
                  </>
                ) : splittingFile ? (
                  <>
                    <CreativeLoader size="sm" className="mr-2" />
                    Splitting into years...
                  </>
                ) : yearlyChunks.length > 0 ? (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download yearly chunks above, then upload each year
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Upload & Process Chat
                  </>
                )}
              </Button>
              
              {yearlyChunks.length > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-2 animate-fade-in">
                  💡 After downloading, select a yearly file above to upload and process it
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sample Preview Dialog */}
        <Dialog open={showSamplePreview} onOpenChange={setShowSamplePreview}>
          <DialogContent className="animate-scale-in">
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

        {/* Edit Import Dialog */}
        <Dialog open={!!editingImport} onOpenChange={(open) => !open && setEditingImport(null)}>
          <DialogContent className="animate-scale-in bg-card/95 backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Edit2 className="h-5 w-5 text-primary-foreground" />
                </div>
                Edit Filename
              </DialogTitle>
              <DialogDescription>
                Update the name of this imported chat
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="filename" className="text-sm font-semibold">Filename</Label>
                <Input
                  id="filename"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  placeholder="Enter new filename"
                  className="h-11 border-2 focus:border-primary transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditImport();
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingImport(null)}
                className="transition-all hover:scale-105"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditImport}
                disabled={!newFilename.trim()}
                className="bg-gradient-primary hover:opacity-90 transition-all hover:scale-105 shadow-md"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingImport} onOpenChange={(open) => !open && setDeletingImport(null)}>
          <DialogContent className="animate-scale-in bg-card/95 backdrop-blur-xl border-2 border-destructive/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-destructive">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                Delete Import
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this import? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {deletingImport && (
              <div className="py-4 px-4 bg-card rounded-lg border border-border">
                <div className="font-semibold mb-1 text-foreground">{deletingImport.filename}</div>
                <div className="text-sm text-muted-foreground">
                  {deletingImport.total_messages} messages • {(deletingImport.file_size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingImport(null)}
                className="transition-all hover:scale-105"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deletingImport && handleDeleteImport(deletingImport.id)}
                className="transition-all hover:scale-105 shadow-md"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Import
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Imports List & Timeline */}
        {imports.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="lg:col-span-1 bg-card backdrop-blur-xl border-border shadow-elegant hover:shadow-premium transition-all duration-500 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                    <div className="p-2 bg-gradient-primary rounded-lg">
                      <FileText className="h-5 w-5 text-primary-foreground" />
                    </div>
                    Imported Chats
                  </CardTitle>
                  {selectedImports.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkDeleting}
                      className="animate-scale-in"
                    >
                      {bulkDeleting ? (
                        <>
                          <CreativeLoader size="sm" className="mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete ({selectedImports.size})
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {imports.length > 1 && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      checked={selectedImports.size === imports.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">
                      Select all ({imports.length})
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                  <ScrollArea className="h-[600px]">
                  <div className="space-y-2 pr-4">
                  {imports.map((imp, idx) => (
                    <Card
                      key={imp.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 border-2 relative group animate-fade-in ${
                        selectedImport === imp.id 
                          ? 'border-primary bg-primary/5 shadow-accent' 
                          : imp.total_messages === 0
                          ? 'border-destructive/50 bg-destructive/5'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => handleSelectImport(imp.id)}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedImports.has(imp.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectImport(imp.id);
                            }}
                            className="mt-1 h-4 w-4 rounded border-border cursor-pointer flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-semibold pr-16 break-words flex-1 text-foreground">{imp.filename}</div>
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
                            
                            {/* Action buttons */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-scale-in">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingImport(imp);
                                  setNewFilename(imp.filename);
                                }}
                                title="Edit filename"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-all hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingImport(imp);
                                }}
                                title="Delete import"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Events Timeline */}
            <Card className="lg:col-span-2 bg-card backdrop-blur-xl border-border shadow-elegant hover:shadow-premium transition-all duration-500 rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
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
                              : 'border-border hover:border-accent/50 bg-card backdrop-blur-sm'
                          }`}
                        >
                          <CardHeader className="p-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-2 bg-gradient-primary rounded-lg">
                                    <Calendar className="h-4 w-4 text-primary-foreground" />
                                  </div>
                                  <CardTitle className="text-base group-hover:text-accent transition-colors line-clamp-1 text-foreground">
                                    {event.title.length > 50 ? event.title.substring(0, 50) + '...' : event.title}
                                  </CardTitle>
                                </div>
                                <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
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
                              <Badge variant="secondary" className="font-medium px-3 py-1 bg-primary/20 text-foreground hover:bg-primary/30 transition-colors">
                                <MessageSquare className="h-3 w-3 mr-1.5" />
                                {event.message_count} messages
                              </Badge>
                              {event.keywords.slice(0, 3).map((kw) => (
                                <Badge key={kw} className="px-3 py-1 bg-accent/20 text-foreground border border-accent/40 hover:bg-accent/30 transition-colors">
                                  {kw}
                                </Badge>
                              ))}
                              {event.keywords.length > 3 && (
                                <Badge className="bg-muted text-foreground border border-border">
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

        {/* Global Search - Available when import is selected */}
        {selectedImport && !selectedEvent && (
          <Card className="mt-8 bg-card backdrop-blur-xl border-border shadow-elegant rounded-2xl overflow-hidden animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
              <CardTitle className="flex items-center gap-2 helvetica-bold text-foreground">
                <Search className="h-5 w-5 text-primary" />
                Search All Messages
              </CardTitle>
              <CardDescription>
                Search through all messages in this import by text, author, or date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search messages, dates (DD/MM/YYYY), or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-background/50 border-2 focus:border-primary"
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (selectedImport) {
                      await fetchMessagesByImport(selectedImport, 0, 100);
                    }
                  }}
                  className="h-12 px-6 bg-gradient-primary hover:shadow-lg"
                  disabled={!selectedImport}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Load & Search Messages
                </Button>
              </div>
              
              {messages.length > 0 && (
                <div className="space-y-4">
                  {/* Search Results Info */}
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span className="font-medium">
                        Found {filteredMessages.length} of {messages.length} messages
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Select value={filterAuthor} onValueChange={setFilterAuthor}>
                        <SelectTrigger className="w-[180px]">
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
                  </div>
                  
                  {/* Search Results */}
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-4">
                      {filteredMessages.slice(0, 50).map((msg) => (
                        <Card key={msg.id} className="p-4 bg-card/50 border border-border/50 hover:border-primary/30 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs font-semibold">
                                  {msg.author}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(msg.datetime_iso).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-foreground break-words">
                                {msg.text.length > 300 
                                  ? msg.text.substring(0, 300) + '...' 
                                  : msg.text
                                }
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyMessage(msg.text)}
                              className="h-8 w-8 p-0 shrink-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {filteredMessages.length > 50 && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          Showing first 50 results. Refine your search to see more specific results.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Click "Load & Search Messages" to start searching through this import</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Messages Viewer */}
        {selectedEvent && selectedEventData && (
          <>
            {/* AI Summary Card */}
            <Card className="mt-8 bg-card border-border shadow-elegant rounded-2xl overflow-hidden animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 helvetica-bold text-foreground">
                    <Sparkles className="h-5 w-5 text-primary" />
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
                      className="bg-gradient-to-r from-primary to-accent hover:shadow-lg"
                      size="sm"
                    >
                      {loadingSummary ? "Generating..." : "Generate Summary"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="bg-card">
                {loadingSummary ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                ) : summary ? (
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-border rounded-lg p-4">
                    <p className="text-sm leading-relaxed text-foreground">{summary}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic text-center py-4">
                    Click "Generate Summary" to get an AI-powered overview of this conversation
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Messages Card */}
            <Card className="mt-8 bg-card backdrop-blur-xl border-border/60 shadow-elegant rounded-2xl overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>
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
              <div className="space-y-4 mt-6 p-6 bg-card/50 rounded-xl border border-border">
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