import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Note, Folder, NotesContextType, NotesContext } from "./NotesTypes";

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  type SessionType = {
    user: {
      id: string;
    };
  } | null;

  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [session, setSession] = useState<SessionType>(null);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
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
        .channel("public:notes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notes",
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
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Convert the returned data to our Note type
      const typedNotes: Note[] = data || [];
      setNotes(typedNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to fetch notes");
    }
  };

  const createNote = async (folder: string = "") => {
    if (!session?.user) {
      toast.error("Please sign in to create notes");
      return;
    }

    try {
      // Define the note data without folder if it's empty
      const noteData: {
        title: string;
        content: string;
        user_id: string;
        folder?: string;
      } = {
        title: "Untitled Note",
        content: "# Untitled Note",
        user_id: session.user.id,
      };

      // Only add folder if it's not empty
      if (folder) {
        noteData.folder = folder;
      }

      const { data, error } = await supabase
        .from("notes")
        .insert(noteData)
        .select()
        .single();

      if (error) throw error;

      // Convert to Note type
      const newNote: Note = data as Note;
      setNotes((prev) => [newNote, ...prev]);
      setActiveNote(newNote);
      toast.success("Note created");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    }
  };

  const createFolder = async (folderName: string): Promise<boolean> => {
    if (!session?.user || !folderName.trim()) {
      toast.error("Please sign in to create folders");
      return false;
    }

    try {
      // First create the folder in the folders table
      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .insert({
          name: folderName.trim(),
          user_id: session.user.id,
        })
        .select()
        .single();

      if (folderError) {
        // Check if error is due to unique constraint
        if (folderError.code === "23505") {
          toast.error(`Folder "${folderName.trim()}" already exists`);
          return false;
        }
        throw folderError;
      }

      // Create a welcome note in the new folder
      const insertPayload = {
        title: `${folderName} - Welcome`,
        content: `# Welcome to ${folderName}\nThis is your first note in this folder.`,
        folder: folderName.trim(),
        user_id: session.user.id,
      };

      const { data: noteData, error: noteError } = await supabase
        .from("notes")
        .insert(insertPayload)
        .select()
        .single();

      if (noteError) {
        // If note creation fails, delete the folder
        await supabase.from("folders").delete().eq("id", folderData.id);
        throw noteError;
      }

      // Add the new note to the state
      const newNote: Note = noteData as Note;
      setNotes((prev) => [newNote, ...prev]);

      toast.success(`Folder "${folderName.trim()}" created`);
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Failed to create folder: ${err.message || "Unknown error"}`);
      return false;
    }
  };

  const updateNote = async (updatedNote: Note) => {
    if (!session?.user) return;

    try {
      // Create an update object with only the fields Supabase expects
      const updateData: {
        title: string;
        content: string | null;
        folder?: string;
      } = {
        title: updatedNote.title,
        content: updatedNote.content,
      };

      // Only add folder if it exists in the updated note
      if (updatedNote.folder !== undefined) {
        updateData.folder = updatedNote.folder;
      }

      const { error } = await supabase
        .from("notes")
        .update(updateData)
        .eq("id", updatedNote.id);

      if (error) throw error;

      setNotes((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );

      if (activeNote?.id === updatedNote.id) {
        setActiveNote(updatedNote);
      }

      toast.success("Note updated");
    } catch (error: unknown) {
      const updateErr = error as { message?: string };
      console.error(
        "Error updating note:",
        updateErr.message || "Unknown error"
      );
      toast.error("Failed to update note");
    }
  };

  const deleteNote = async (id: string) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);

      if (error) throw error;

      setNotes((prev) => prev.filter((note) => note.id !== id));

      if (activeNote?.id === id) {
        const nextNote = notes.find((note) => note.id !== id);
        setActiveNote(nextNote || null);
      }

      toast.success("Note deleted");
    } catch (error: unknown) {
      const deleteErr = error as { message?: string };
      console.error(
        "Error deleting note:",
        deleteErr.message || "Unknown error"
      );
      toast.error("Failed to delete note");
    }
  };

  const getFolders = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("name");

      if (error) throw error;

      return data as Folder[];
    } catch (error: unknown) {
      console.error("Error fetching folders:", error);
      toast.error("Failed to fetch folders");
      return [];
    }
  };

  const getNotesByFolder = (folder: string) => {
    return notes.filter((note) => note.folder === folder);
  };

  const moveNoteToFolder = async (noteId: string, targetFolder: string) => {
    const noteToUpdate = notes.find((note) => note.id === noteId);

    if (!noteToUpdate || !session?.user) return;

    try {
      const updatedNote = { ...noteToUpdate, folder: targetFolder };

      // Create an update object with only the folder property
      const updateData = { folder: targetFolder };

      const { error } = await supabase
        .from("notes")
        .update(updateData)
        .eq("id", noteId);

      if (error) throw error;

      setNotes((prev) =>
        prev.map((note) => (note.id === noteId ? updatedNote : note))
      );

      if (activeNote?.id === noteId) {
        setActiveNote(updatedNote);
      }

      toast.success(`Note moved to ${targetFolder}`);
    } catch (error) {
      console.error("Error moving note:", error);
      toast.error("Failed to move note");
    }
  };

  const deleteFolder = async (folderName: string): Promise<boolean> => {
    if (!session?.user) {
      toast.error("Please sign in to delete folders");
      return false;
    }

    try {
      // First delete all notes in the folder
      const { error: notesError } = await supabase
        .from("notes")
        .delete()
        .eq("folder", folderName);

      if (notesError) throw notesError;

      // Then delete the folder
      const { error: folderError } = await supabase
        .from("folders")
        .delete()
        .eq("name", folderName);

      if (folderError) throw folderError;

      // Update local state
      setNotes((prev) => prev.filter((note) => note.folder !== folderName));
      if (activeNote?.folder === folderName) {
        setActiveNote(null);
      }

      toast.success(`Folder "${folderName}" deleted`);
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Failed to delete folder: ${err.message || "Unknown error"}`);
      return false;
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        activeNote,
        setActiveNote,
        createNote,
        createFolder,
        updateNote,
        deleteNote,
        deleteFolder,
        getFolders,
        getNotesByFolder,
        moveNoteToFolder,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
