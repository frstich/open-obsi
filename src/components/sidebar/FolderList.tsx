
import React from 'react';
import { Note } from '@/context/NotesContext';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronRight, Folder, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from '@/components/ui/input';

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
              className="mb-1"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, folder)}
            >
              <div 
                className={cn(
                  "flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer hover:bg-obsidian-hover text-sm",
                  draggedNoteId ? "bg-obsidian-gray" : ""
                )}
                onClick={() => toggleFolder(folder)}
              >
                {editingFolderId === folder ? (
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => handleRenameFolder(e, folder)}
                    className="h-7 text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
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
    </>
  );
};

export default FolderList;
