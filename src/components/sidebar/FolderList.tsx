
import React from 'react';
import { Note } from '@/context/NotesContext';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronRight, Folder, File, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface FolderListProps {
  folders: string[];
  expandedFolders: Record<string, boolean>;
  toggleFolder: (folder: string) => void;
  getNotesByFolder: (folder: string) => Note[];
  handleCreateNote: (folder: string) => void;
  draggedNoteId: string | null;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, noteId: string) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, folder: string) => void;
  setActiveNote: (note: Note) => void;
  activeNote?: Note;
  editingFolderId: string | null;
  setEditingFolderId: (id: string | null) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  handleRenameFolder: (e: React.KeyboardEvent<HTMLInputElement>, oldName: string) => void;
}

const FolderList: React.FC<FolderListProps> = ({
  folders,
  expandedFolders,
  toggleFolder,
  getNotesByFolder,
  handleCreateNote,
  draggedNoteId,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  setActiveNote,
  activeNote,
  editingFolderId,
  setEditingFolderId,
  newFolderName,
  setNewFolderName,
  handleRenameFolder,
}) => {
  const isExpanded = (folder: string) => expandedFolders[folder] !== false;

  return (
    <>
      {folders.map(folder => (
        <ContextMenu key={folder}>
          <ContextMenuTrigger>
            <div 
              className="mb-2 rounded-md overflow-hidden hover:bg-obsidian-hover/20"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, folder)}
            >
              <div 
                className={cn(
                  "flex items-center gap-1 px-1 py-1 rounded cursor-pointer hover:bg-obsidian-hover text-sm",
                  draggedNoteId ? "bg-obsidian-gray" : ""
                )}
                onClick={() => toggleFolder(folder)}
              >
                {editingFolderId === folder ? (
                  <div className="flex items-center w-full">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => handleRenameFolder(e, folder)}
                      className="h-7 text-sm pr-8"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 -ml-7 text-obsidian-lightgray hover:text-obsidian-purple"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolderId(null);
                      }}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ) : (
                  <>
                    {isExpanded(folder) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Folder size={14} className="text-obsidian-lightgray" />
                    <span className="truncate">{folder}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-auto text-obsidian-lightgray hover:text-obsidian-purple"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateNote(folder);
                      }}
                    >
                      <Plus size={12} />
                    </Button>
                  </>
                )}
              </div>
              
              {isExpanded(folder) && getNotesByFolder(folder).map((note: Note) => (
                <div
                  key={note.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, note.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-1 px-7 py-1 text-sm rounded cursor-pointer hover:bg-obsidian-hover",
                    activeNote?.id === note.id ? "bg-obsidian-selected" : "",
                    draggedNoteId === note.id ? "opacity-50" : ""
                  )}
                  onClick={() => setActiveNote(note)}
                >
                  <File size={14} className="text-obsidian-lightgray" />
                  <span className="truncate">{note.title}</span>
                </div>
              ))}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => setEditingFolderId(folder)}>
              Rename Folder
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
      
      {folders.length === 0 && (
        <div className="text-sm text-obsidian-lightgray px-2 py-1 italic">
          Use the folder icon to create folders
        </div>
      )}
    </>
  );
};

export default FolderList;
