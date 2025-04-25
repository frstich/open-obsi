import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Note = {
  id: string;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
};

type NotesContextType = {
  notes: Note[];
  activeNote: Note | null;
  setActiveNote: (note: Note | null) => void;
  createNote: (folder?: string) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  getFolders: () => string[];
  getNotesByFolder: (folder: string) => Note[];
  moveNoteToFolder: (noteId: string, targetFolder: string) => void;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      // Fetch notes when user is authenticated
      fetchNotes();

      // Subscribe to realtime changes
      const channel = supabase
        .channel('public:notes')
        .on('postgres_changes', 
          {
            event: '*',
            schema: 'public',
            table: 'notes'
          }, 
          (payload) => {
            fetchNotes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setNotes([]);
      setActiveNote(null);
    }
  }, [session]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
    }
  };

  const createNote = async (folder: string = "") => {
    if (!session?.user) {
      toast.error('Please sign in to create notes');
      return;
    }

    try {
      const newNote = {
        title: "Untitled Note",
        content: "# Untitled Note",
        folder
      };

      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      setActiveNote(data);
      toast.success('Note created');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const updateNote = async (updatedNote: Note) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: updatedNote.title,
          content: updatedNote.content,
        })
        .eq('id', updatedNote.id);

      if (error) throw error;

      setNotes(prev => 
        prev.map(note => 
          note.id === updatedNote.id ? updatedNote : note
        )
      );
      
      if (activeNote?.id === updatedNote.id) {
        setActiveNote(updatedNote);
      }

      toast.success('Note updated');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const deleteNote = async (id: string) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      
      if (activeNote?.id === id) {
        const nextNote = notes.find(note => note.id !== id);
        setActiveNote(nextNote || null);
      }

      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const getFolders = () => {
    const folders = notes.map(note => note.folder);
    return [...new Set(folders)].filter(folder => folder);
  };

  const getNotesByFolder = (folder: string) => {
    return notes.filter(note => note.folder === folder);
  };

  const moveNoteToFolder = (noteId: string, targetFolder: string) => {
    // Implementation for moving a note to a folder
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        activeNote,
        setActiveNote,
        createNote,
        updateNote,
        deleteNote,
        getFolders,
        getNotesByFolder,
        moveNoteToFolder
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};
