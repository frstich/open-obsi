
import React, { useState } from 'react';
import { Folder, File, Search, Settings, Plus, ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { useNotes, Note } from '../context/NotesContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type SidebarProps = {
  isCollapsed: boolean;
  toggle: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggle }) => {
  const { notes, activeNote, setActiveNote, createNote, getFolders, getNotesByFolder } = useNotes();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [searchText, setSearchText] = useState('');

  const folders = getFolders();
  const unfolderedNotes = notes.filter(note => !note.folder || note.folder === '');

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  const isExpanded = (folder: string) => {
    return expandedFolders[folder] !== false; // Default to expanded
  };

  const handleCreateNote = (folder: string = '') => {
    createNote(folder);
    // Auto-expand the folder when creating a note in it
    if (folder) {
      setExpandedFolders(prev => ({
        ...prev,
        [folder]: true
      }));
    }
  };

  const filteredNotes = searchText
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchText.toLowerCase()) || 
        note.content.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-obsidian border-r border-obsidian-border flex flex-col transition-all duration-300",
      isCollapsed ? "w-12" : "w-64"
    )}>
      <div className="flex items-center p-2 h-12 border-b border-obsidian-border">
        {!isCollapsed && (
          <h1 className="font-semibold text-lg text-obsidian-foreground flex-1">Nebula Notes</h1>
        )}
        <Button variant="ghost" size="icon" onClick={toggle} className="text-obsidian-foreground hover:text-obsidian-purple">
          <Menu size={18} />
        </Button>
      </div>

      {!isCollapsed && (
        <div className="px-2 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-obsidian-lightgray" />
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-obsidian-gray text-sm rounded pl-8 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-obsidian-purple"
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        {!isCollapsed ? (
          <>
            {searchText ? (
              <div className="px-2 py-1">
                <div className="text-xs text-obsidian-lightgray mb-1">Search Results</div>
                {filteredNotes.length > 0 ? (
                  filteredNotes.map(note => (
                    <div
                      key={note.id}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 text-sm rounded cursor-pointer hover:bg-obsidian-hover",
                        activeNote?.id === note.id ? "bg-obsidian-selected" : ""
                      )}
                      onClick={() => setActiveNote(note)}
                    >
                      <File size={14} className="text-obsidian-lightgray" />
                      <span className="truncate">{note.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-obsidian-lightgray px-2 py-1">No results found</div>
                )}
              </div>
            ) : (
              <div className="px-2 py-1">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-obsidian-lightgray">NOTES</div>
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

                {/* Folders */}
                {folders.map(folder => (
                  <div key={folder} className="mb-1">
                    <div 
                      className="flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer hover:bg-obsidian-hover text-sm"
                      onClick={() => toggleFolder(folder)}
                    >
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
                    </div>
                    
                    {isExpanded(folder) && getNotesByFolder(folder).map((note: Note) => (
                      <div
                        key={note.id}
                        className={cn(
                          "flex items-center gap-1 px-7 py-1 text-sm rounded cursor-pointer hover:bg-obsidian-hover",
                          activeNote?.id === note.id ? "bg-obsidian-selected" : ""
                        )}
                        onClick={() => setActiveNote(note)}
                      >
                        <File size={14} className="text-obsidian-lightgray" />
                        <span className="truncate">{note.title}</span>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Notes without folders */}
                {unfolderedNotes.map(note => (
                  <div
                    key={note.id}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-sm rounded cursor-pointer hover:bg-obsidian-hover",
                      activeNote?.id === note.id ? "bg-obsidian-selected" : ""
                    )}
                    onClick={() => setActiveNote(note)}
                  >
                    <File size={14} className="text-obsidian-lightgray" />
                    <span className="truncate">{note.title}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center pt-2 gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-obsidian-lightgray hover:text-obsidian-purple"
                  onClick={() => handleCreateNote()}
                >
                  <Plus size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>New Note</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-obsidian-lightgray hover:text-obsidian-purple"
                >
                  <Search size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Search</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-obsidian-lightgray hover:text-obsidian-purple"
                >
                  <Settings size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
