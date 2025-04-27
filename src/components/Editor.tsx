import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNotes, Note } from "../context/NotesTypes"; // Adjusted import path if necessary
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Save, Trash, Copy, CopyCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MarkdownRenderer from "./MarkdownRenderer";
import CanvasView from "./canvas/CanvasView"; // Import CanvasView

const Editor: React.FC<{
  className?: string;
  isCollapsed: boolean;
  isPreviewVisible: boolean;
}> = ({ className, isCollapsed, isPreviewVisible }) => {
  const { activeNote, updateNote, deleteNote } = useNotes();
  const [isEditing, setIsEditing] = useState(false); // Primarily for Markdown title/content
  const [editedContent, setEditedContent] = useState<string | null>(null); // Markdown content
  const [editedTitle, setEditedTitle] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<string | null>(null);
  const [lastSavedTitle, setLastSavedTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Debounced save function specifically for Markdown content changes
  const debouncedMarkdownSave = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (note: Note) => {
      if (note.type !== "markdown") return; // Only save markdown content this way

      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          setIsSaving(true);
          // Only update title and content for markdown notes via debounce
          const noteToUpdate = {
            ...note,
            title: editedTitle, // Include title in debounce as well
            content: editedContent,
            updated_at: new Date().toISOString(),
          };
          await updateNote(noteToUpdate);
          setLastSavedContent(editedContent);
          setLastSavedTitle(editedTitle); // Update last saved title here too
          toast({
            title: "Changes saved",
            description: "Markdown changes have been auto-saved.",
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
      }, 1000); // 1-second debounce
    };
  }, [updateNote, toast, editedTitle, editedContent]); // Add editedTitle and editedContent dependencies

  // Effect to initialize state when activeNote changes
  useEffect(() => {
    if (activeNote) {
      setEditedTitle(activeNote.title);
      setLastSavedTitle(activeNote.title);
      if (activeNote.type === "markdown") {
        const content = activeNote.content || "";
        setEditedContent(content);
        setLastSavedContent(content);
      } else {
        // For canvas or other types, clear markdown-specific content state
        setEditedContent(null);
        setLastSavedContent(null);
      }
      setIsEditing(false); // Reset editing state on note change
    } else {
      // Clear state if no note is active
      setEditedTitle("");
      setEditedContent(null);
      setLastSavedTitle("");
      setLastSavedContent(null);
    }
  }, [activeNote]);

  // Auto-save effect for Markdown content and title changes
  useEffect(() => {
    if (!activeNote || activeNote.type !== "markdown") return;

    // Trigger debounce if title or markdown content has changed
    if (editedContent !== lastSavedContent || editedTitle !== lastSavedTitle) {
      const updatedNote: Note = {
        ...activeNote,
        title: editedTitle,
        content: editedContent, // Pass current edited content
        updated_at: new Date().toISOString(),
      };
      debouncedMarkdownSave(updatedNote);
    }
  }, [
    activeNote,
    editedContent,
    editedTitle,
    lastSavedContent,
    lastSavedTitle,
    debouncedMarkdownSave,
  ]);

  // Manual save function
  const handleSave = async () => {
    if (!activeNote) return;

    setIsSaving(true);
    try {
      const noteToUpdate: Partial<Note> & { id: string } = {
        id: activeNote.id,
        title: editedTitle,
        type: activeNote.type, // Preserve note type
        updated_at: new Date().toISOString(),
      };

      // Only include content if it's a markdown note
      if (activeNote.type === "markdown") {
        noteToUpdate.content = editedContent ?? ""; // Ensure content is string
      }
      // Note: Canvas data is saved within the CanvasView component itself

      await updateNote(noteToUpdate as Note); // Cast needed if updateNote expects full Note

      setLastSavedTitle(editedTitle);
      if (activeNote.type === "markdown") {
        setLastSavedContent(editedContent);
      }
      setIsEditing(false); // Exit editing mode for title

      toast({
        title: "Note saved",
        description: "Your changes have been manually saved.",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save the note.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
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
    if (!activeNote) return;

    let textToCopy: string | null = null;
    let successMessage = "";

    if (activeNote.type === "markdown") {
      textToCopy = editedContent ?? "";
      successMessage = "Markdown content copied.";
    } else if (activeNote.type === "canvas" && activeNote.canvas_data) {
      try {
        textToCopy = JSON.stringify(activeNote.canvas_data, null, 2); // Pretty print JSON
        successMessage = "Canvas data (JSON) copied.";
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Could not serialize canvas data.",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }
    }

    if (textToCopy !== null) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setIsCopied(true);
          toast({
            title: "Copied to Clipboard",
            description: successMessage,
            duration: 2000,
          });
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(() => {
          toast({
            title: "Copy Failed",
            description: "Unable to copy content to clipboard.",
            variant: "destructive",
            duration: 2000,
          });
        });
    } else {
      toast({
        title: "Nothing to Copy",
        description: "There is no content to copy for this note type.",
        variant: "default",
        duration: 2000,
      });
    }
  };

  if (!activeNote) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center text-center p-4",
          className,
          isCollapsed ? "ml-12" : "ml-64" // Adjust margin based on sidebar state
        )}
      >
        <div>
          <h2 className="text-xl font-semibold mb-2">No Note Selected</h2>
          <p className="text-obsidian-lightgray">
            Select a note from the sidebar or create a new one.
          </p>
        </div>
      </div>
    );
  }

  // Determine copy button text/tooltip
  const copyButtonTooltip =
    activeNote.type === "canvas" ? "Copy Canvas Data (JSON)" : "Copy Markdown";

  return (
    <div
      className={cn(
        "flex flex-col flex-1 h-full transition-margin duration-300 ease-in-out", // Use transition-margin
        className,
        isCollapsed ? "ml-12" : "ml-64" // Adjust margin based on sidebar state
      )}
    >
      {/* Header */}
      <div className="border-b border-obsidian-border p-2 flex justify-between items-center flex-shrink-0">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onFocus={() => setIsEditing(true)} // Allow title editing anytime
          placeholder="Note Title"
          className="bg-transparent text-lg font-semibold flex-1 focus:outline-none focus:border-b focus:border-obsidian-purple mr-2"
        />
        <div className="flex gap-1 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="text-obsidian-lightgray hover:text-obsidian-purple"
            title={copyButtonTooltip}
          >
            {isCopied ? <CopyCheck size={18} /> : <Copy size={18} />}
          </Button>
          <div className="flex items-center gap-1">
            {isSaving && (
              <span className="text-xs text-obsidian-lightgray animate-pulse mr-1">
                Saving...
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="text-obsidian-lightgray hover:text-obsidian-purple"
              title="Save Changes"
            >
              <Save size={18} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-obsidian-lightgray hover:text-destructive"
            title="Delete Note"
          >
            <Trash size={18} />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeNote.type === "canvas" ? (
          // Render Canvas View
          <CanvasView note={activeNote} />
        ) : (
          // Render Markdown Editor/Preview
          <div
            className={cn(
              "w-full h-full flex",
              isPreviewVisible ? "divide-x divide-obsidian-border" : ""
            )}
          >
            {/* Markdown Editor */}
            <div
              className={cn(
                "h-full overflow-y-auto",
                isPreviewVisible ? "w-1/2" : "w-full"
              )}
            >
              <textarea
                value={editedContent ?? ""} // Handle null case
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Start typing your markdown here..."
                className="w-full h-full bg-obsidian resize-none p-4 outline-none font-mono text-sm"
              />
            </div>
            {/* Markdown Preview */}
            {isPreviewVisible && (
              <div className="w-1/2 overflow-y-auto p-4">
                <MarkdownRenderer content={editedContent ?? ""} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
