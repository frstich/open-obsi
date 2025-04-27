import React, { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import { useNotes, Note } from "../context/NotesTypes";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<string>("");
  const [editedTitle, setEditedTitle] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<string>("");
  const [lastSavedTitle, setLastSavedTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "typing" | "saving" | "saved"
  >("idle"); // New state for save status
  const { toast } = useToast();
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for the 'saved' timeout

  // Refs to hold the latest values for the debounced function
  const editedTitleRef = useRef(editedTitle);
  const editedContentRef = useRef(editedContent);

  useEffect(() => {
    editedTitleRef.current = editedTitle;
  }, [editedTitle]);

  useEffect(() => {
    editedContentRef.current = editedContent;
  }, [editedContent]);

  // Debounced save function using lodash.debounce
  const debouncedSave = useCallback(
    debounce(async (noteToSave: Note) => {
      // Use refs to get the latest values when the debounced function executes
      const currentTitle = editedTitleRef.current;
      const currentContent = editedContentRef.current;

      // Double-check if it's still a markdown note before saving
      if (noteToSave.type !== "markdown") {
        console.warn("Debounced save called for non-markdown note. Skipping.");
        return;
      }

      // Avoid saving if nothing actually changed (compared to last *saved* state)
      // This check might be slightly redundant due to the trigger useEffect, but adds safety
      if (
        currentTitle === lastSavedTitle &&
        currentContent === lastSavedContent
      ) {
        // console.log("Debounced save skipped: No changes detected.");
        // console.log("Debounced save skipped: No changes detected.");
        setSaveStatus("idle"); // Reset status if no changes
        return;
      }

      setSaveStatus("saving"); // Indicate saving process started
      try {
        const noteToUpdate: Note = {
          ...noteToSave,
          title: currentTitle,
          content: currentContent, // Already a string
          updated_at: new Date().toISOString(),
        };
        await updateNote(noteToUpdate);
        setLastSavedTitle(currentTitle);
        setLastSavedContent(currentContent);
        setSaveStatus("saved"); // Indicate saving completed
        // Toast is optional now with the status indicator
        // toast({
        //   title: "Changes saved",
        //   description: "Note auto-saved.",
        //   duration: 1500,
        // });
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSaveStatus("idle"); // Reset status on failure
        toast({
          title: "Save failed",
          description: "Failed to auto-save changes. Try manual save.",
          variant: "destructive",
          duration: 3000,
        });
      }
      // No finally block needed for setIsSaving anymore
    }, 1500),
    [updateNote, toast, lastSavedTitle, lastSavedContent] // Removed setIsSaving
  );

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
        setEditedContent(""); // Set to empty string for non-markdown
        setLastSavedContent("");
      }
      setIsEditing(false);
      setSaveStatus("idle"); // Reset save status on note change
    } else {
      // Clear state if no note is active
      setEditedTitle("");
      setEditedContent("");
      setLastSavedTitle("");
      setLastSavedContent("");
      setSaveStatus("idle"); // Reset save status
    }
  }, [activeNote]);

  // Auto-save trigger effect for Markdown notes
  useEffect(() => {
    if (!activeNote || activeNote.type !== "markdown") {
      // If not a markdown note or no active note, cancel any pending saves
      debouncedSave.cancel();
      return;
    }

    // Trigger debounce if title or markdown content has changed
    if (editedContent !== lastSavedContent || editedTitle !== lastSavedTitle) {
      setSaveStatus("typing"); // Indicate user is typing / changes pending
      // Pass the current activeNote structure. The debounced function
      // will use refs internally to get the *latest* title/content when it executes.
      debouncedSave(activeNote);
    } else {
      // If content matches last saved, ensure status is idle (unless currently saving/saved)
      if (saveStatus !== "saving" && saveStatus !== "saved") {
        setSaveStatus("idle");
      }
    }

    // Cleanup function to cancel debounce on unmount or when dependencies change significantly (like activeNote)
    return () => {
      debouncedSave.cancel();
    };
  }, [
    activeNote, // Important: Re-evaluate when the note itself changes
    editedContent,
    editedTitle,
    lastSavedContent,
    lastSavedTitle,
    debouncedSave,
    saveStatus, // Add saveStatus as dependency if logic depends on it
  ]);

  // Effect to handle the 'saved' status timeout
  useEffect(() => {
    // Clear any existing timeout when status changes or component unmounts
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
      saveStatusTimeoutRef.current = null;
    }

    if (saveStatus === "saved") {
      saveStatusTimeoutRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, 1500); // Keep "Saved" message for 1.5 seconds
    }

    // Cleanup function
    return () => {
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, [saveStatus]);

  // Manual save function
  const handleSave = async () => {
    if (!activeNote) return;

    // Cancel any pending debounced save
    debouncedSave.cancel();
    setSaveStatus("saving"); // Show saving status immediately

    try {
      const noteToUpdate: Partial<Note> & { id: string } = {
        id: activeNote.id,
        title: editedTitle,
        type: activeNote.type, // Preserve note type
        updated_at: new Date().toISOString(),
      };

      // Only include content if it's a markdown note
      if (activeNote.type === "markdown") {
        noteToUpdate.content = editedContent; // Already a string
      }
      // Note: Canvas data is saved within the CanvasView component itself

      await updateNote(noteToUpdate as Note); // Cast needed if updateNote expects full Note

      setLastSavedTitle(editedTitle);
      if (activeNote.type === "markdown") {
        setLastSavedContent(editedContent);
      }
      setIsEditing(false);
      setSaveStatus("saved"); // Show saved status

      // Optional: Keep toast for manual save confirmation
      toast({
        title: "Note saved",
        description: "Your changes have been manually saved.",
        duration: 2000,
      });
    } catch (error) {
      setSaveStatus("idle"); // Reset status on failure
      toast({
        title: "Save Failed",
        description: "Could not save the note.",
        variant: "destructive",
        duration: 3000,
      });
    }
    // No finally block needed
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
      textToCopy = editedContent; // Already a string
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
          onChange={(e) => {
            setEditedTitle(e.target.value);
            // setSaveStatus("typing"); // Trigger typing status on change - Handled by useEffect
          }}
          onFocus={() => setIsEditing(true)}
          placeholder="Note Title"
          className="bg-transparent text-lg font-semibold flex-1 focus:outline-none focus:border-b focus:border-obsidian-purple mr-2"
        />
        <div className="flex gap-2 items-center">
          {/* Save Status Indicator */}
          <span
            className={cn(
              "text-xs text-obsidian-lightgray transition-opacity duration-300",
              saveStatus === "typing" || saveStatus === "saving"
                ? "opacity-100 animate-pulse" // Show and pulse for typing/saving
                : saveStatus === "saved"
                ? "opacity-100" // Show for saved
                : "opacity-0" // Hide for idle
            )}
          >
            {saveStatus === "typing" || saveStatus === "saving"
              ? "Syncing..."
              : saveStatus === "saved"
              ? "Saved"
              : ""}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="text-obsidian-lightgray hover:text-obsidian-purple"
            title={copyButtonTooltip}
          >
            {isCopied ? <CopyCheck size={18} /> : <Copy size={18} />}
          </Button>
          {/* Manual Save Button - Still useful */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            disabled={saveStatus === "saving"} // Disable while saving
            className="text-obsidian-lightgray hover:text-obsidian-purple disabled:opacity-50"
            title="Save Changes Now"
          >
            <Save size={18} />
          </Button>
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
                value={editedContent ?? ""}
                onChange={(e) => {
                  setEditedContent(e.target.value);
                  // setSaveStatus("typing"); // Trigger typing status on change - Handled by useEffect
                }}
                placeholder="Start typing your markdown here..."
                className="w-full h-full bg-obsidian resize-none p-4 outline-none font-mono text-sm"
              />
            </div>
            {/* Markdown Preview */}
            {isPreviewVisible && (
              <div className="w-1/2 overflow-y-auto p-4">
                <MarkdownRenderer content={editedContent} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
