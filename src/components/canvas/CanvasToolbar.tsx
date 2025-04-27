import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TextIcon, StickyNoteIcon, ImageIcon } from "lucide-react"; // Assuming lucide-react for icons

interface CanvasToolbarProps {
  onAddTextNode: () => void;
  onAddNoteNode: () => void; // Will likely trigger a modal/selection
  onAddImageNode: () => void; // Will likely trigger a prompt/modal
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onAddTextNode,
  onAddNoteNode,
  onAddImageNode,
}) => {
  return (
    <TooltipProvider>
      <div className="absolute top-4 left-4 z-10 bg-background p-2 rounded-md shadow-md border border-border flex space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onAddTextNode}>
              <TextIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Text Node</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onAddNoteNode}>
              <StickyNoteIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Note Node</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onAddImageNode}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Image Node</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default CanvasToolbar;
