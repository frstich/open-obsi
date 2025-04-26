
import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import SidebarHeader from './sidebar/SidebarHeader';
import SidebarSearch from './sidebar/SidebarSearch';
import FolderList from './sidebar/FolderList';
import NoteList from './sidebar/NoteList';
import CollapsedSidebar from './sidebar/CollapsedSidebar';

interface SidebarProps {
  isCollapsed: boolean;
  toggle: () => void;
  openCommandPalette?: () => void;
  togglePreview: () => void;
  isPreviewVisible: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  toggle, 
  openCommandPalette,
  togglePreview,
  isPreviewVisible
}) => {
  const { notes, activeNote, setActiveNote, createNote, createFolder, getFolders, getNotesByFolder, moveNoteToFolder } = useNotes();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [searchText, setSearchText] = useState('');
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingFolderLoading, setIsCreatingFolderLoading] = useState(false);

  const folders = getFolders();
  const unfolderedNotes = notes.filter(note => !note.folder || note.folder === '');
  const filteredNotes = searchText
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchText.toLowerCase()) || 
        note.content.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  const handleCreateNote = (folder: string = '') => {
    createNote(folder);
    if (folder) {
      setExpandedFolders(prev => ({
        ...prev,
        [folder]: true
      }));
    }
  };

  // Improved folder creation handler
  const handleCreateFolder = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newFolderName.trim()) {
      setIsCreatingFolderLoading(true);
      try {
        // Use the dedicated folder creation function
        const success = await createFolder(newFolderName.trim());
        
        if (success) {
          // Auto-expand the newly created folder
          setExpandedFolders(prev => ({
            ...prev,
            [newFolderName.trim()]: true
          }));
          
          // Reset UI state
          setIsCreatingFolder(false);
          setNewFolderName('');
        }
      } finally {
        setIsCreatingFolderLoading(false);
      }
    } else if (e.key === 'Escape') {
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  };

  // Function to cancel folder creation
  const cancelFolderCreation = () => {
    setIsCreatingFolder(false);
    setNewFolderName('');
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, noteId: string) => {
    e.dataTransfer.setData('text/plain', noteId);
    setDraggedNoteId(noteId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetFolder: string) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('text/plain');
    
    if (noteId && targetFolder) {
      moveNoteToFolder(noteId, targetFolder);
      toast.success(`Note moved to ${targetFolder}`);
    }
    
    setDraggedNoteId(null);
  };

  const handleDragEnd = () => {
    setDraggedNoteId(null);
  };

  const handleRenameFolder = (e: React.KeyboardEvent<HTMLInputElement>, oldName: string) => {
    if (e.key === 'Enter' && newFolderName.trim() && newFolderName !== oldName) {
      const notesInFolder = getNotesByFolder(oldName);
      notesInFolder.forEach(note => {
        moveNoteToFolder(note.id, newFolderName.trim());
      });
      setEditingFolderId(null);
      toast.success(`Folder renamed to ${newFolderName}`);
    } else if (e.key === 'Escape') {
      setEditingFolderId(null);
    }
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-obsidian border-r border-obsidian-border flex flex-col transition-all duration-300",
      isCollapsed ? "w-12" : "w-64"
    )}>
      <SidebarHeader 
        isCollapsed={isCollapsed}
        toggle={toggle}
        togglePreview={togglePreview}
        isPreviewVisible={isPreviewVisible}
      />

      {!isCollapsed ? (
        <>
          <SidebarSearch 
            searchText={searchText}
            setSearchText={setSearchText}
            isCollapsed={isCollapsed}
          />

          <ScrollArea className="flex-1">
            {searchText ? (
              <div className="px-2 py-1">
                <div className="text-xs text-obsidian-lightgray mb-1">Search Results</div>
                {filteredNotes.length > 0 ? (
                  <NoteList
                    notes={filteredNotes}
                    activeNote={activeNote}
                    setActiveNote={setActiveNote}
                    draggedNoteId={draggedNoteId}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                  />
                ) : (
                  <div className="text-sm text-obsidian-lightgray px-2 py-1">No results found</div>
                )}
              </div>
            ) : (
              <div className="px-2 py-1">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-obsidian-lightgray">NOTES</div>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-obsidian-lightgray hover:text-obsidian-purple"
                          onClick={() => setIsCreatingFolder(true)}
                        >
                          <FolderPlus size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>New Folder</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-obsidian-lightgray hover:text-obsidian-purple"
                          onClick={() => handleCreateNote()}
                        >
                          <Plus size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>New Note</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {isCreatingFolder && (
                  <div className="mb-2 px-1">
                    <div className="relative">
                      <Input
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={handleCreateFolder}
                        placeholder="New folder name..."
                        className="h-7 text-sm pr-8"
                        autoFocus
                        disabled={isCreatingFolderLoading}
                      />
                      <div className="absolute right-2 top-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-obsidian-lightgray hover:text-obsidian-purple"
                          onClick={cancelFolderCreation}
                          disabled={isCreatingFolderLoading}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-obsidian-lightgray mt-1">
                      Press Enter to create or Escape to cancel
                    </div>
                  </div>
                )}

                <FolderList
                  folders={folders}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                  getNotesByFolder={getNotesByFolder}
                  handleCreateNote={handleCreateNote}
                  draggedNoteId={draggedNoteId}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  handleDragOver={handleDragOver}
                  handleDrop={handleDrop}
                  setActiveNote={setActiveNote}
                  activeNote={activeNote}
                  editingFolderId={editingFolderId}
                  setEditingFolderId={setEditingFolderId}
                  newFolderName={newFolderName}
                  setNewFolderName={setNewFolderName}
                  handleRenameFolder={handleRenameFolder}
                />

                <NoteList
                  notes={unfolderedNotes}
                  activeNote={activeNote}
                  setActiveNote={setActiveNote}
                  draggedNoteId={draggedNoteId}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                />
              </div>
            )}
          </ScrollArea>
        </>
      ) : (
        <CollapsedSidebar
          handleCreateNote={() => handleCreateNote()}
          openCommandPalette={openCommandPalette}
        />
      )}
    </div>
  );
};

export default Sidebar;
