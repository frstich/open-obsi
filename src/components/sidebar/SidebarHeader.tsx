
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Eye, EyeOff } from 'lucide-react';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  toggle: () => void;
  togglePreview: () => void;
  isPreviewVisible: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isCollapsed,
  toggle,
  togglePreview,
  isPreviewVisible
}) => {
  return (
    <div className="flex items-center p-2 h-12 border-b border-obsidian-border">
      {!isCollapsed && (
        <h1 className="font-semibold text-lg text-obsidian-foreground flex-1">Open Obsi</h1>
      )}
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={togglePreview} className="text-obsidian-foreground hover:text-obsidian-purple">
          {isPreviewVisible ? <Eye size={18} /> : <EyeOff size={18} />}
        </Button>
        <Button variant="ghost" size="icon" onClick={toggle} className="text-obsidian-foreground hover:text-obsidian-purple">
          <Menu size={18} />
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;
