import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, MapPin, Clock, Pencil, Trash2, Sparkles, CalendarDays, Share2, Copy } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
}

const Events = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_date: format(new Date(), "yyyy-MM-dd"),
    event_time: "",
    location: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (event: typeof newEvent) => {
      const { data, error } = await supabase
        .from("events")
        .insert([event])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        event_date: format(new Date(), "yyyy-MM-dd"),
        event_time: "",
        location: "",
      });
      toast({
        title: "Event created",
        description: "Your event has been added to the calendar.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, event }: { id: string; event: typeof newEvent }) => {
      const { data, error } = await supabase
        .from("events")
        .update(event)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingEventId(null);
      setNewEvent({
        title: "",
        description: "",
        event_date: format(new Date(), "yyyy-MM-dd"),
        event_time: "",
        location: "",
      });
      toast({
        title: "Event updated",
        description: "Your event has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setDeleteEventId(null);
      toast({
        title: "Event deleted",
        description: "The event has been removed from the calendar.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const handleCreateOrUpdateEvent = () => {
    if (!newEvent.title || !newEvent.event_date) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title and date for the event.",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditMode && editingEventId) {
      updateEventMutation.mutate({ id: editingEventId, event: newEvent });
    } else {
      createEventMutation.mutate(newEvent);
    }
  };

  const handleEditEvent = (event: Event) => {
    setIsEditMode(true);
    setEditingEventId(event.id);
    setNewEvent({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date,
      event_time: event.event_time || "",
      location: event.location || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    setDeleteEventId(id);
  };

  const confirmDelete = () => {
    if (deleteEventId) {
      deleteEventMutation.mutate(deleteEventId);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingEventId(null);
    setNewEvent({
      title: "",
      description: "",
      event_date: format(new Date(), "yyyy-MM-dd"),
      event_time: "",
      location: "",
    });
  };

  const copyEventDetails = (event: Event) => {
    const eventText = `
📅 ${event.title}
${event.description ? `\n${event.description}\n` : ''}
📆 Date: ${format(new Date(event.event_date), "MMMM d, yyyy")}
${event.event_time ? `🕐 Time: ${event.event_time}` : ''}
${event.location ? `📍 Location: ${event.location}` : ''}
    `.trim();

    navigator.clipboard.writeText(eventText);
    toast({
      title: "Copied!",
      description: "Event details copied to clipboard",
    });
  };

  const shareEvent = async (event: Event) => {
    const eventDetails = `📅 ${event.title}\n\n${event.description || ''}\n\n🗓️ Date: ${new Date(event.event_date).toLocaleDateString()}${event.event_time ? `\n⏰ Time: ${event.event_time}` : ''}${event.location ? `\n📍 Location: ${event.location}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: eventDetails,
        });
        toast({
          title: "Shared Successfully",
          description: "Event details have been shared",
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyEventDetails(event);
        }
      }
    } else {
      copyEventDetails(event);
    }
  };

  // Filter events by selected date
  const eventsForSelectedDate = events.filter(
    (event) =>
      selectedDate &&
      format(new Date(event.event_date), "yyyy-MM-dd") ===
        format(selectedDate, "yyyy-MM-dd")
  );

  // Get dates that have events for calendar highlighting
  const eventDates = events.map((event) => new Date(event.event_date));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with animated gradient */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8 animate-fade-in">
            <div className="relative w-full sm:w-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl opacity-30 rounded-full"></div>
              <div className="relative">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-primary to-accent rounded-lg sm:rounded-xl shadow-lg">
                    <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                    Upcoming Webinars/Events
                  </h1>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground ml-0 sm:ml-16 flex items-center gap-2">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                  Stay updated with upcoming Trade Finance Week events
                </p>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (open) {
                setIsDialogOpen(true);
              } else {
                handleCloseDialog();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/50">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "Edit Event" : "Create New Event"}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? "Update event details" : "Add a new event to the TFW calendar"}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                      placeholder="Event title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, description: e.target.value })
                      }
                      placeholder="Event description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event_date">Date *</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={newEvent.event_date}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, event_date: e.target.value })
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="event_time">Time</Label>
                      <Input
                        id="event_time"
                        type="time"
                        value={newEvent.event_time}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, event_time: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, location: e.target.value })
                      }
                      placeholder="Event location"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateOrUpdateEvent}
                    disabled={createEventMutation.isPending || updateEventMutation.isPending}
                    className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
                  >
                    {isEditMode 
                      ? (updateEventMutation.isPending ? "Updating..." : "Update Event")
                      : (createEventMutation.isPending ? "Creating..." : "Create Event")
                    }
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {/* Calendar */}
            <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar
                </CardTitle>
                <CardDescription>Select a date to view events</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasEvent: eventDates,
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      fontWeight: "bold",
                      textDecoration: "underline",
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Events List */}
            <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle>
                  {selectedDate
                    ? `Events on ${format(selectedDate, "MMMM d, yyyy")}`
                    : "Select a date"}
                </CardTitle>
                <CardDescription>
                  {eventsForSelectedDate.length === 0
                    ? "No events scheduled"
                    : `${eventsForSelectedDate.length} event(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventsForSelectedDate.map((event, index) => (
                    <div
                      key={event.id}
                      className="group p-4 border border-border/50 rounded-lg bg-gradient-to-br from-card to-card/50 hover:from-accent/10 hover:to-accent/5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in relative"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-foreground">{event.title}</h3>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        {event.event_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.event_time}</span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events Section */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="h-1 w-12 bg-gradient-to-r from-primary to-accent rounded-full"></div>
              All Upcoming Webinars/Events
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events
                .filter((event) => new Date(event.event_date) >= new Date())
                .map((event, index) => (
                  <Card 
                    key={event.id} 
                    className="group border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 hover:scale-[1.03] animate-scale-in relative overflow-hidden min-h-[280px] flex flex-col"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="relative">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{event.title}</CardTitle>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-accent/10 hover:text-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyEventDetails(event);
                            }}
                            title="Copy event details"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-primary/10"
                            onClick={() => handleEditEvent(event)}
                            title="Edit event"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteEvent(event.id)}
                            title="Delete event"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {format(new Date(event.event_date), "MMMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative flex-1 flex flex-col">
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-4 flex-1">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-sm mt-auto">
                        {event.event_time && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{event.event_time}</span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
};

export default Events;
