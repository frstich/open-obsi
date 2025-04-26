import React from "react";
import { Note } from "@/context/NotesTypes";
import { File } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteListProps {
  notes: Note[];
  activeNote?: Note;
  setActiveNote: (note: Note) => void;
  draggedNoteId: string | null;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, noteId: string) => void;
  handleDragEnd: () => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  activeNote,
  setActiveNote,
  draggedNoteId,
  handleDragStart,
  handleDragEnd,
}) => {
  return (
    <>
      {notes.map((note) => (
        <div
          key={note.id}
          draggable
          onDragStart={(e) => handleDragStart(e, note.id)}
          onDragEnd={handleDragEnd}
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-sm rounded cursor-pointer hover:bg-obsidian-hover",
            activeNote?.id === note.id ? "bg-obsidian-selected" : "",
            draggedNoteId === note.id ? "opacity-50" : ""
          )}
          onClick={() => setActiveNote(note)}
        >
          <File size={14} className="text-obsidian-lightgray" />
          <span className="truncate">{note.title}</span>
        </div>
      ))}
    </>
  );
};

export default NoteList;
