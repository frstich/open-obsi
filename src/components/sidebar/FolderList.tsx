import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Note, useNotes } from "@/context/NotesTypes";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderPlus,
  Plus,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";

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
  handleRenameFolder: (
    e: React.KeyboardEvent<HTMLInputElement>,
    oldName: string
  ) => void;
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

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderInput, setNewFolderInput] = useState("");
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  const { createFolder, deleteFolder } = useNotes();

  const handleCreateFolder = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && newFolderInput.trim()) {
      const success = await createFolder(newFolderInput.trim());
      if (success) {
        setIsCreatingFolder(false);
        setNewFolderInput("");
      }
    } else if (e.key === "Escape") {
      setIsCreatingFolder(false);
      setNewFolderInput("");
    }
  };

  return (
    <>
      <div className="mb-2 px-1">
        {isCreatingFolder ? (
          <div
            className={cn(
              "flex items-center w-full transition-all duration-200 ease-in-out opacity-0",
              isCreatingFolder && "opacity-100"
            )}
          >
            <Input
              value={newFolderInput}
              onChange={(e) => setNewFolderInput(e.target.value)}
              onKeyDown={handleCreateFolder}
              className="h-7 text-sm pr-8 rounded-md bg-obsidian-hover/30 border-obsidian-lightgray/20 focus-visible:ring-obsidian-purple focus-visible:ring-opacity-50"
              placeholder="New folder name..."
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 -ml-7 text-obsidian-lightgray hover:text-obsidian-purple transition-colors duration-150"
              onClick={() => {
                setIsCreatingFolder(false);
                setNewFolderInput("");
              }}
              aria-label="Cancel folder creation"
            >
              <X size={12} />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm text-obsidian-lightgray hover:text-obsidian-purple"
            onClick={() => setIsCreatingFolder(true)}
          >
            <FolderPlus size={14} className="mr-2" />
            New Folder
          </Button>
        )}
      </div>

      {folders.map((folder) => (
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
                  <div className="flex items-center w-full transition-all duration-200 ease-in-out">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => handleRenameFolder(e, folder)}
                      className="h-7 text-sm pr-8 rounded-md bg-obsidian-hover/30 border-obsidian-lightgray/20 focus-visible:ring-obsidian-purple focus-visible:ring-opacity-50"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 -ml-7 text-obsidian-lightgray hover:text-obsidian-purple transition-colors duration-150"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolderId(null);
                        setNewFolderName("");
                      }}
                      aria-label="Cancel folder rename"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ) : (
                  <>
                    {isExpanded(folder) ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
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

              {isExpanded(folder) &&
                getNotesByFolder(folder).map((note: Note) => (
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
            <AlertDialog
              open={folderToDelete === folder}
              onOpenChange={(open) => !open && setFolderToDelete(null)}
            >
              <AlertDialogTrigger asChild>
                <ContextMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setFolderToDelete(folder);
                  }}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Folder
                </ContextMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Deleting this folder will permanently remove all notes
                    within it. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={async () => {
                      if (folderToDelete) {
                        await deleteFolder(folderToDelete);
                        setFolderToDelete(null);
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
