
import React, { useState, useEffect } from 'react';
import { useNotes, Note } from '../context/NotesContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Save, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MarkdownRenderer from './MarkdownRenderer';

const Editor: React.FC<{ className?: string, isCollapsed: boolean }> = ({ className, isCollapsed }) => {
  const { activeNote, updateNote, deleteNote } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (activeNote) {
      setEditedContent(activeNote.content);
      setEditedTitle(activeNote.title);
    }
  }, [activeNote]);

  const handleSave = () => {
    if (!activeNote) return;

    const updatedNote: Note = {
      ...activeNote,
      title: editedTitle,
      content: editedContent,
      path: editedTitle,
      updatedAt: new Date()
    };

    updateNote(updatedNote);
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

  if (!activeNote) {
    return (
      <div className={cn(
        "flex flex-1 items-center justify-center",
        className,
        isCollapsed ? "ml-12" : "ml-64"
      )}>
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold mb-2">No Note Selected</h2>
          <p className="text-obsidian-lightgray">Select a note from the sidebar or create a new one.</p>
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
      {/* Editor Header */}
      <div className="border-b border-obsidian-border p-2 flex justify-between items-center">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onFocus={() => setIsEditing(true)}
          className="bg-transparent text-lg font-semibold flex-1 focus:outline-none focus:border-b focus:border-obsidian-purple"
        />
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSave}
            className="text-obsidian-lightgray hover:text-obsidian-purple"
          >
            <Save size={18} />
          </Button>
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

      {/* Editor Content */}
      <div className="flex-1 flex">
        <div className="w-full h-full flex">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-1/2 h-full bg-obsidian resize-none p-4 outline-none font-mono text-sm"
            />
          ) : (
            <div 
              className="w-1/2 p-4 cursor-text"
              onClick={() => setIsEditing(true)}
            >
              <pre className="font-mono text-sm whitespace-pre-wrap">{editedContent}</pre>
            </div>
          )}
          <div className="w-1/2 overflow-auto p-4 border-l border-obsidian-border">
            <MarkdownRenderer content={editedContent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
