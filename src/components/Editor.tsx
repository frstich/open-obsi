import React, { useState, useEffect, useCallback } from "react";
import { useNotes, Note } from "../context/NotesTypes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Save, Trash, Copy, CopyCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MarkdownRenderer from "./MarkdownRenderer";
import { useMemo } from "react";

const Editor: React.FC<{
  className?: string;
  isCollapsed: boolean;
  isPreviewVisible: boolean;
}> = ({ className, isCollapsed, isPreviewVisible }) => {
  const { activeNote, updateNote, deleteNote } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState("");
  const [lastSavedTitle, setLastSavedTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Create a debounced save function that only triggers after 1 second of no changes
  const debouncedSave = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (note: Note) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          setIsSaving(true);
          await updateNote(note);
          setLastSavedContent(note.content || "");
          setLastSavedTitle(note.title);
          toast({
            title: "Changes saved",
            description: "All changes have been auto-saved.",
            duration: 1000,
          });
        } catch (error) {
          toast({
            title: "Save failed",
            description: "Failed to auto-save changes. Try manual save.",
            variant: "destructive",
            duration: 3000,
          });
        } finally {
          setIsSaving(false);
        }
      }, 1000);
    };
  }, [updateNote, toast]);

  useEffect(() => {
    if (activeNote) {
      setEditedContent(activeNote.content || "");
      setEditedTitle(activeNote.title);
      setLastSavedContent(activeNote.content || "");
      setLastSavedTitle(activeNote.title);
    }
  }, [activeNote]);

  // Auto-save effect for content changes
  useEffect(() => {
    if (!activeNote) return;

    if (editedContent !== lastSavedContent || editedTitle !== lastSavedTitle) {
      const updatedNote: Note = {
        ...activeNote,
        title: editedTitle,
        content: editedContent,
        updated_at: new Date().toISOString(),
      };

      debouncedSave(updatedNote);
    }
  }, [
    activeNote,
    editedContent,
    editedTitle,
    lastSavedContent,
    lastSavedTitle,
    debouncedSave,
  ]);

  // Manual save function for the save button
  const handleSave = () => {
    if (!activeNote) return;

    const updatedNote: Note = {
      ...activeNote,
      title: editedTitle,
      content: editedContent,
      updated_at: new Date().toISOString(),
    };

    updateNote(updatedNote);
    setLastSavedContent(editedContent);
    setLastSavedTitle(editedTitle);
    setIsEditing(false);

    toast({
      title: "Note saved",
      description: "Your changes have been saved.",
      duration: 2000,
    });
  };

  const handleDelete = () => {
    if (!activeNote) return;

    deleteNote(activeNote.id);

    toast({
      title: "Note deleted",
      description: "The note has been permanently deleted.",
      duration: 2000,
    });
  };

  const handleCopy = () => {
    if (activeNote && activeNote.content) {
      navigator.clipboard
        .writeText(activeNote.content)
        .then(() => {
          setIsCopied(true);
          toast({
            title: "Copied to Clipboard",
            description: "Note content has been copied.",
            duration: 2000,
          });

          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch((err) => {
          toast({
            title: "Copy Failed",
            description: "Unable to copy note content.",
            variant: "destructive",
            duration: 2000,
          });
        });
    }
  };

  if (!activeNote) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center",
          className,
          isCollapsed ? "ml-12" : "ml-64"
        )}
      >
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold mb-2">No Note Selected</h2>
          <p className="text-obsidian-lightgray">
            Select a note from the sidebar or create a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col flex-1 h-full transition-all duration-300",
        className,
        isCollapsed ? "ml-12" : "ml-64"
      )}
    >
      <div className="border-b border-obsidian-border p-2 flex justify-between items-center">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onFocus={() => setIsEditing(true)}
          className="bg-transparent text-lg font-semibold flex-1 focus:outline-none focus:border-b focus:border-obsidian-purple"
        />
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="text-obsidian-lightgray hover:text-obsidian-purple"
          >
            {isCopied ? <CopyCheck size={18} /> : <Copy size={18} />}
          </Button>
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-xs text-obsidian-lightgray animate-pulse">
                Saving...
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="text-obsidian-lightgray hover:text-obsidian-purple"
            >
              <Save size={18} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-obsidian-lightgray hover:text-destructive"
          >
            <Trash size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div
          className={cn(
            "w-full h-full flex",
            isPreviewVisible ? "divide-x divide-obsidian-border" : ""
          )}
        >
          <div className={cn("h-full", isPreviewVisible ? "w-1/2" : "w-full")}>
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-full bg-obsidian resize-none p-4 outline-none font-mono text-sm"
              />
            ) : (
              <div
                className="w-full h-full p-4 cursor-text"
                onClick={() => setIsEditing(true)}
              >
                <pre className="font-mono text-sm whitespace-pre-wrap">
                  {editedContent}
                </pre>
              </div>
            )}
          </div>
          {isPreviewVisible && (
            <div className="w-1/2 overflow-auto p-4">
              <MarkdownRenderer content={editedContent} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
