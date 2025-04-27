import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNotes, Note } from "../context/NotesTypes";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
  // CommandSeparator, // Removed as it's not used
} from "@/components/ui/command";
import {
  BrainCircuit,
  File,
  FolderPlus,
  PlusCircle,
  Search,
  LucideIcon,
} from "lucide-react"; // Added BrainCircuit and LucideIcon
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define a type for the items in the command palette list
type CommandPaletteItem = {
  type: "note" | "command" | "folder";
  item: Note | string;
  title: string;
  icon?: LucideIcon; // Added optional icon property
};

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { notes, setActiveNote, createNote, getFolders } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<CommandPaletteItem[]>([]); // Use the defined type
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // State to store folders
  const [folders, setFolders] = useState<string[]>([]);

  // Fetch folders when component mounts or getFolders changes
  useEffect(() => {
    const loadFolders = async () => {
      const foldersList = await getFolders();
      setFolders(foldersList.map((folder) => folder.name));
    };

    loadFolders();
  }, [getFolders]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // Delay focus slightly for modal transition
    }
  }, [isOpen]);

  // Filter notes and commands based on search query
  useEffect(() => {
    // Define base commands
    const baseCommands: CommandPaletteItem[] = [
      {
        type: "command" as const,
        item: "new-note",
        title: "Create new note",
        icon: PlusCircle, // Assign icon
      },
      {
        type: "command" as const,
        item: "new-canvas", // Add new canvas command
        title: "Create new canvas",
        icon: BrainCircuit, // Assign BrainCircuit icon
      },
    ];

    if (!searchQuery) {
      const allNotes: CommandPaletteItem[] = notes.map((note) => ({
        type: "note" as const,
        item: note,
        title: note.title,
        icon: File, // Assign icon for notes
      }));

      const folderItems: CommandPaletteItem[] = folders.map((folder) => ({
        type: "folder" as const,
        item: folder,
        title: `Folder: ${folder}`,
        icon: FolderPlus, // Assign icon for folders
      }));

      setFilteredItems([...baseCommands, ...folderItems, ...allNotes]);
      return;
    }

    // Filter notes
    const matchingNotes: CommandPaletteItem[] = notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((note) => ({
        type: "note" as const,
        item: note,
        title: note.title,
        icon: File, // Assign icon
      }));

    // Filter folders
    const matchingFolders: CommandPaletteItem[] = folders
      .filter((folder) =>
        folder.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((folder) => ({
        type: "folder" as const,
        item: folder,
        title: `Folder: ${folder}`,
        icon: FolderPlus, // Assign icon
      }));

    // Filter commands
    const matchingCommands: CommandPaletteItem[] = baseCommands.filter((cmd) =>
      cmd.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredItems([
      ...matchingCommands,
      ...matchingFolders,
      ...matchingNotes,
    ]);
  }, [searchQuery, notes, folders]); // Added folders dependency

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleSelect = (item: CommandPaletteItem) => {
    if (item.type === "note") {
      setActiveNote(item.item as Note);
      onClose();
    } else if (item.type === "command") {
      if (item.item === "new-note") {
        createNote(); // Default creates markdown
        onClose();
      } else if (item.item === "new-canvas") {
        // Handle new canvas command
        createNote(undefined, "canvas"); // Pass 'canvas' type
        onClose();
      }
    } else if (item.type === "folder") {
      // Assuming clicking a folder creates a new note inside it
      createNote(item.item as string);
      onClose();
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      const element = listRef.current.children[selectedIndex] as HTMLElement;
      element.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Helper to render icon
  const renderIcon = (IconComponent?: LucideIcon) => {
    if (!IconComponent)
      return <Search className="mr-2 h-4 w-4 text-obsidian-lightgray" />; // Default icon
    return <IconComponent className="mr-2 h-4 w-4 text-obsidian-lightgray" />;
  };

  // Group items by type for rendering
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<CommandPaletteItem["type"], CommandPaletteItem[]>);

  // Calculate offsets for selectedIndex highlighting
  const commandCount = groupedItems.command?.length ?? 0;
  const folderCount = groupedItems.folder?.length ?? 0;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {" "}
      {/* Ensure it overlays everything */}
      <CommandDialog open={isOpen} onOpenChange={onClose}>
        <CommandInput
          ref={inputRef}
          placeholder="Search notes, folders or commands... (Ctrl+P)"
          value={searchQuery}
          onValueChange={setSearchQuery}
          onKeyDown={handleKeyDown}
        />
        <CommandList ref={listRef} className="max-h-[60vh]">
          <CommandEmpty className="py-6 text-center text-sm text-obsidian-lightgray">
            No results found
          </CommandEmpty>
          {filteredItems.length > 0 && (
            <>
              {groupedItems.command && (
                <CommandGroup heading="Actions">
                  {groupedItems.command.map((item, index) => (
                    <CommandItem
                      key={`${item.type}-${item.item as string}`}
                      onSelect={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        index === selectedIndex && "bg-obsidian-selected"
                      )}
                      value={item.title} // Add value for better accessibility/filtering if needed
                    >
                      {renderIcon(item.icon)}
                      <span className="text-sm">{item.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {groupedItems.folder && (
                <CommandGroup heading="Folders">
                  {groupedItems.folder.map((item, index) => (
                    <CommandItem
                      key={`${item.type}-${item.item as string}`}
                      onSelect={() => handleSelect(item)}
                      onMouseEnter={() =>
                        setSelectedIndex(index + commandCount)
                      }
                      className={cn(
                        index + commandCount === selectedIndex &&
                          "bg-obsidian-selected"
                      )}
                      value={item.title}
                    >
                      {renderIcon(item.icon)}
                      <span className="text-sm">{item.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {groupedItems.note && (
                <CommandGroup heading="Notes">
                  {groupedItems.note.map((item, index) => (
                    <CommandItem
                      key={(item.item as Note).id}
                      onSelect={() => handleSelect(item)}
                      onMouseEnter={() =>
                        setSelectedIndex(index + commandCount + folderCount)
                      }
                      className={cn(
                        index + commandCount + folderCount === selectedIndex &&
                          "bg-obsidian-selected"
                      )}
                      value={item.title}
                    >
                      {renderIcon(item.icon)}
                      <span className="text-sm">{item.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </div>,
    document.body // Render directly into body
  );
};

export default CommandPalette;
