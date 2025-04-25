
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Note = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  folder?: string; // Add folder as an optional property
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
        folder: folder,
        user_id: session.user.id
      };

      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select()
        .single();

      if (error) throw error;

      // TypeScript will automatically recognize data as Note
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
          folder: updatedNote.folder
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
    const folders = notes
      .map(note => note.folder)
      .filter((folder): folder is string => Boolean(folder));
    return [...new Set(folders)];
  };

  const getNotesByFolder = (folder: string) => {
    return notes.filter(note => note.folder === folder);
  };

  const moveNoteToFolder = async (noteId: string, targetFolder: string) => {
    const noteToUpdate = notes.find(note => note.id === noteId);
    
    if (!noteToUpdate || !session?.user) return;
    
    try {
      const updatedNote = { ...noteToUpdate, folder: targetFolder };
      
      const { error } = await supabase
        .from('notes')
        .update({ folder: targetFolder })
        .eq('id', noteId);
        
      if (error) throw error;
      
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      
      if (activeNote?.id === noteId) {
        setActiveNote(updatedNote);
      }
      
      toast.success(`Note moved to ${targetFolder}`);
    } catch (error) {
      console.error('Error moving note:', error);
      toast.error('Failed to move note');
    }
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
