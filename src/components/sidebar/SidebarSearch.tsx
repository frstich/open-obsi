
import React from 'react';
import { Search } from 'lucide-react';

interface SidebarSearchProps {
  searchText: string;
  setSearchText: (text: string) => void;
  isCollapsed: boolean;
}

const SidebarSearch: React.FC<SidebarSearchProps> = ({
  searchText,
  setSearchText,
  isCollapsed
}) => {
  if (isCollapsed) return null;

  return (
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
  );
};

export default SidebarSearch;
