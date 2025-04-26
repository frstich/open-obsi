import { createContext, useContext } from "react";

export type Folder = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

export type Note = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  folder?: string;
};

export type NotesContextType = {
  notes: Note[];
  activeNote: Note | null;
  setActiveNote: (note: Note | null) => void;
  createNote: (folder?: string) => void;
  createFolder: (folderName: string) => Promise<boolean>;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  deleteFolder: (folderName: string) => Promise<boolean>;
  getFolders: () => Promise<Folder[]>;
  getNotesByFolder: (folder: string) => Note[];
  moveNoteToFolder: (noteId: string, targetFolder: string) => void;
};

export const NotesContext = createContext<NotesContextType | undefined>(
  undefined
);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};
