import React, { createContext, useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  path: string;
  folder: string;
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

const initialNotes: Note[] = [
  {
    id: uuidv4(),
    title: "Welcome to Nebula Notes",
    content: `# Welcome to Nebula Notes

This is your first note. You can edit it or create new ones.

## Features:
- Create and organize notes in folders
- Format text using Markdown syntax
- Link between notes using [[Note Title]] syntax
- Search for notes using the command palette (Ctrl+P)

## Markdown Guide:
You can use Markdown to format your notes:
- **Bold text**
- *Italic text*
- # Headings
- [Links](https://example.com)
- Lists (like this one)
- \`Code blocks\`
- > Blockquotes

Happy note-taking!`,
    createdAt: new Date(),
    updatedAt: new Date(),
    path: "Welcome to Nebula Notes",
    folder: ""
  },
  {
    id: uuidv4(),
    title: "Markdown Guide",
    content: `# Markdown Guide

Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.

## Basic Syntax

### Headings
# Heading 1
## Heading 2
### Heading 3

### Emphasis
*Italic text* or _Italic text_
**Bold text** or __Bold text__
***Bold and italic text***

### Lists
#### Unordered Lists
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2

#### Ordered Lists
1. First item
2. Second item
3. Third item

### Links
[Link text](URL)
[Visit OpenAI](https://openai.com)

### Images
![Alt text](URL)

### Blockquotes
> This is a blockquote

### Code
Inline code: \`var example = "hello";\`

Code blocks:
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

### Horizontal Rules
---

## Advanced Markdown

### Tables
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

### Task Lists
- [x] Completed task
- [ ] Incomplete task

### Linking to other notes
In this app, you can link to other notes using double brackets:
[[Welcome to Nebula Notes]]

Clicking on these links will navigate to the referenced note.`,
    createdAt: new Date(),
    updatedAt: new Date(),
    path: "Markdown Guide",
    folder: "Guides"
  }
];

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem("nebula-notes");
    return savedNotes ? JSON.parse(savedNotes) : initialNotes;
  });
  
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    localStorage.setItem("nebula-notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (notes.length > 0 && !activeNote) {
      setActiveNote(notes[0]);
    }
  }, []);

  const createNote = (folder: string = "") => {
    const newNote: Note = {
      id: uuidv4(),
      title: "Untitled Note",
      content: "# Untitled Note",
      createdAt: new Date(),
      updatedAt: new Date(),
      path: "Untitled Note",
      folder
    };

    setNotes([...notes, newNote]);
    setActiveNote(newNote);
  };

  const updateNote = (updatedNote: Note) => {
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id 
        ? { ...updatedNote, updatedAt: new Date() } 
        : note
    );
    
    setNotes(updatedNotes);
    
    if (activeNote && activeNote.id === updatedNote.id) {
      setActiveNote({ ...updatedNote, updatedAt: new Date() });
    }
  };

  const deleteNote = (id: string) => {
    const filteredNotes = notes.filter(note => note.id !== id);
    setNotes(filteredNotes);
    
    if (activeNote && activeNote.id === id) {
      if (filteredNotes.length > 0) {
        setActiveNote(filteredNotes[0]);
      } else {
        setActiveNote(null);
      }
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
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, folder: targetFolder, updatedAt: new Date() }
        : note
    );
    setNotes(updatedNotes);
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
