import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNotes, Note } from "../context/NotesTypes";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
  CommandSeparator,
} from "@/components/ui/command";
import { File, FolderPlus, PlusCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { notes, setActiveNote, createNote, getFolders } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<
    Array<{
      type: "note" | "command" | "folder";
      item: Note | string;
      title: string;
    }>
  >([]);
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
      }, 100);
    }
  }, [isOpen]);

  // Filter notes and commands based on search query
  useEffect(() => {
    if (!searchQuery) {
      const allNotes = notes.map((note) => ({
        type: "note" as const,
        item: note,
        title: note.title,
      }));

      const folderItems = folders.map((folder) => ({
        type: "folder" as const,
        item: folder,
        title: `Folder: ${folder}`,
      }));

      const commands = [
        {
          type: "command" as const,
          item: "new-note",
          title: "Create new note",
        },
      ];

      setFilteredItems([...commands, ...folderItems, ...allNotes]);
      return;
    }

    const matchingNotes = notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((note) => ({
        type: "note" as const,
        item: note,
        title: note.title,
      }));

    const matchingFolders = folders
      .filter((folder) =>
        folder.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((folder) => ({
        type: "folder" as const,
        item: folder,
        title: `Folder: ${folder}`,
      }));

    const matchingCommands = [
      { type: "command" as const, item: "new-note", title: "Create new note" },
    ].filter((cmd) =>
      cmd.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredItems([
      ...matchingCommands,
      ...matchingFolders,
      ...matchingNotes,
    ]);
  }, [searchQuery, notes, folders]);

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

  const handleSelect = (item: (typeof filteredItems)[0]) => {
    if (item.type === "note") {
      setActiveNote(item.item as Note);
      onClose();
    } else if (item.type === "command") {
      if (item.item === "new-note") {
        createNote();
        onClose();
      }
    } else if (item.type === "folder") {
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

  return createPortal(
    <div className="fixed inset-0 z-50">
      <CommandDialog open={isOpen} onOpenChange={onClose}>
        <CommandInput
          ref={inputRef}
          placeholder="Search notes, folders or commands... (Ctrl+P)"
          value={searchQuery}
          onValueChange={setSearchQuery}
          onKeyDown={handleKeyDown}
        />
        <CommandList ref={listRef} className="max-h-[60vh]">
          <CommandEmpty className="py-6 text-sm text-obsidian-lightgray">
            No results found
          </CommandEmpty>
          {filteredItems.length > 0 && (
            <>
              {filteredItems.some((item) => item.type === "command") && (
                <CommandGroup heading="Actions">
                  {filteredItems
                    .filter((item) => item.type === "command")
                    .map((item, index) => (
                      <CommandItem
                        key={`${item.type}-${item.item as string}`}
                        onSelect={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          index === selectedIndex && "bg-obsidian-selected"
                        )}
                      >
                        <PlusCircle className="mr-2 h-4 w-4 text-obsidian-lightgray" />
                        <span className="text-sm">{item.title}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}

              {filteredItems.some((item) => item.type === "folder") && (
                <CommandGroup heading="Folders">
                  {filteredItems
                    .filter((item) => item.type === "folder")
                    .map((item, index) => {
                      const commandsCount = filteredItems.filter(
                        (i) => i.type === "command"
                      ).length;
                      return (
                        <CommandItem
                          key={`${item.type}-${item.item as string}`}
                          onSelect={() => handleSelect(item)}
                          onMouseEnter={() =>
                            setSelectedIndex(index + commandsCount)
                          }
                          className={cn(
                            index + commandsCount === selectedIndex &&
                              "bg-obsidian-selected"
                          )}
                        >
                          <FolderPlus className="mr-2 h-4 w-4 text-obsidian-lightgray" />
                          <span className="text-sm">{item.title}</span>
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              )}

              {filteredItems.some((item) => item.type === "note") && (
                <CommandGroup heading="Notes">
                  {filteredItems
                    .filter((item) => item.type === "note")
                    .map((item, index) => {
                      const commandsAndFoldersCount = filteredItems.filter(
                        (i) => i.type === "command" || i.type === "folder"
                      ).length;
                      return (
                        <CommandItem
                          key={(item.item as Note).id}
                          onSelect={() => handleSelect(item)}
                          onMouseEnter={() =>
                            setSelectedIndex(index + commandsAndFoldersCount)
                          }
                          className={cn(
                            index + commandsAndFoldersCount === selectedIndex &&
                              "bg-obsidian-selected"
                          )}
                        >
                          <File className="mr-2 h-4 w-4 text-obsidian-lightgray" />
                          <span className="text-sm">{item.title}</span>
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </div>,
    document.body
  );
};

export default CommandPalette;
