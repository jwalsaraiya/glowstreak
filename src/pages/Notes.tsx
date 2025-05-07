
import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, FileText, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const Notes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'personal'
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Load notes from localStorage
  useEffect(() => {
    if (!user) return;
    
    const userData = localStorage.getItem(`userData_${user.id}`);
    const parsedData = userData ? JSON.parse(userData) : {};
    
    if (parsedData.notes) {
      setNotes(parsedData.notes);
    } else {
      setNotes([]);
    }
  }, [user]);

  // Save notes to localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    if (!user) return;
    
    const userData = localStorage.getItem(`userData_${user.id}`);
    const parsedData = userData ? JSON.parse(userData) : {};
    
    parsedData.notes = updatedNotes;
    localStorage.setItem(`userData_${user.id}`, JSON.stringify(parsedData));
    setNotes(updatedNotes);
  };

  // Create a new note
  const handleCreateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    const now = new Date();
    const note: Note = {
      id: Math.random().toString(36).substring(2, 9),
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      category: newNote.category,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    const updatedNotes = [...notes, note];
    saveNotes(updatedNotes);
    
    setNewNote({
      title: '',
      content: '',
      category: 'personal'
    });
    
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Note created successfully"
    });
  };

  // Update an existing note
  const handleUpdateNote = () => {
    if (!editingNote) return;
    
    if (!editingNote.title.trim() || !editingNote.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    const now = new Date();
    const updatedNotes = notes.map(note => 
      note.id === editingNote.id 
        ? { ...editingNote, updatedAt: now.toISOString() } 
        : note
    );
    
    saveNotes(updatedNotes);
    setCurrentNote({ ...editingNote, updatedAt: now.toISOString() });
    setEditingNote(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Note updated successfully"
    });
  };

  // Delete a note
  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
    setCurrentNote(null);
    setIsViewDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Note deleted successfully"
    });
  };

  // Open edit dialog
  const handleEditClick = () => {
    if (!currentNote) return;
    
    setEditingNote({ ...currentNote });
    setIsViewDialogOpen(false);
    setIsEditDialogOpen(true);
  };

  // Filter notes based on search and category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || note.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(notes.map(note => note.category))];

  // Get date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Notes</h1>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
        <ScrollArea className="w-full">
          <TabsList className={`mb-4 ${isMobile ? 'flex w-auto' : 'w-full md:w-auto flex'} overflow-x-auto`}>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value={activeCategory} className="mt-0">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-xl font-medium">No notes found</h3>
              <p className="text-muted-foreground mt-2">
                {notes.length === 0
                  ? "Create your first note to get started"
                  : "No notes match your current filters"}
              </p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                Create Note
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  setCurrentNote(note);
                  setIsViewDialogOpen(true);
                }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {note.category}
                      </span>
                    </div>
                    <CardDescription className="text-xs">
                      Created {formatDate(note.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">{note.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Note Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Add a title, content and category for your note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea
                id="content"
                placeholder="Write your note here..."
                className="min-h-[120px]"
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newNote.category}
                onChange={(e) => setNewNote({...newNote, category: e.target.value})}
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="ideas">Ideas</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNote}>Create Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Note Dialog */}
      {currentNote && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle className="pr-4">{currentNote.title}</DialogTitle>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {currentNote.category}
                </span>
              </div>
              <DialogDescription className="flex justify-between items-center">
                <span>Created {formatDate(currentNote.createdAt)}</span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick();
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(currentNote.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[300px] mt-2">
              <div className="p-2 whitespace-pre-wrap">{currentNote.content}</div>
            </ScrollArea>
            {currentNote.updatedAt !== currentNote.createdAt && (
              <div className="text-xs text-muted-foreground mt-2">
                Last updated: {formatDate(currentNote.updatedAt)}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Note Dialog */}
      {editingNote && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setCurrentNote(editingNote);
            setIsViewDialogOpen(true);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>
                Update your note's details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
                <Input
                  id="edit-title"
                  placeholder="Note title"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-content" className="text-sm font-medium">Content</label>
                <Textarea
                  id="edit-content"
                  placeholder="Write your note here..."
                  className="min-h-[120px]"
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
                <select
                  id="edit-category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingNote.category}
                  onChange={(e) => setEditingNote({...editingNote, category: e.target.value})}
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="study">Study</option>
                  <option value="ideas">Ideas</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setCurrentNote(editingNote);
                setIsViewDialogOpen(true);
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateNote}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Notes;
