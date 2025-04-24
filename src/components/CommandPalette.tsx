
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNotes, Note } from '../context/NotesContext';
import { CommandItem } from '@/components/ui/command';
import { File, PlusCircle, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { notes, setActiveNote, createNote } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<
    Array<{ type: 'note' | 'command'; item: Note | string; title: string }>
  >([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter notes and commands based on search query
  useEffect(() => {
    if (!searchQuery) {
      const allNotes = notes.map(note => ({ 
        type: 'note' as const, 
        item: note, 
        title: note.title 
      }));
      
      const commands = [
        { type: 'command' as const, item: 'new-note', title: 'Create new note' }
      ];
      
      setFilteredItems([...commands, ...allNotes]);
      return;
    }

    const matchingNotes = notes
      .filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(note => ({ type: 'note' as const, item: note, title: note.title }));

    const matchingCommands = [
      { type: 'command' as const, item: 'new-note', title: 'Create new note' }
    ].filter(cmd => cmd.title.toLowerCase().includes(searchQuery.toLowerCase()));

    setFilteredItems([...matchingCommands, ...matchingNotes]);
  }, [searchQuery, notes]);

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleSelect = (item: typeof filteredItems[0]) => {
    if (item.type === 'note') {
      setActiveNote(item.item as Note);
    } else if (item.type === 'command') {
      if (item.item === 'new-note') {
        createNote();
      }
    }
    onClose();
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      const element = listRef.current.children[selectedIndex] as HTMLElement;
      element.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-[20vh]">
      <div 
        className="w-[600px] max-w-[90vw] bg-obsidian rounded-lg shadow-xl overflow-hidden animate-fade-in"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center p-2 border-b border-obsidian-border">
          <Search className="ml-2 w-5 h-5 text-obsidian-lightgray" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes or commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent py-2 px-3 focus:outline-none text-obsidian-foreground"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-obsidian-hover text-obsidian-lightgray"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-1" ref={listRef}>
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-obsidian-lightgray">
              No results found
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={item.type === 'note' ? (item.item as Note).id : item.item as string}
                className={cn(
                  "command-item",
                  index === selectedIndex && "selected"
                )}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {item.type === 'note' ? (
                  <File size={16} className="text-obsidian-lightgray" />
                ) : (
                  <PlusCircle size={16} className="text-obsidian-lightgray" />
                )}
                <span>{item.title}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandPalette;
