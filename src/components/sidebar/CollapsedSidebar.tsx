
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Settings } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CollapsedSidebarProps {
  handleCreateNote: () => void;
  openCommandPalette?: () => void;
}

const CollapsedSidebar: React.FC<CollapsedSidebarProps> = ({
  handleCreateNote,
  openCommandPalette,
}) => {
  return (
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
            onClick={openCommandPalette}
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
  );
};

export default CollapsedSidebar;
