
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderPlus } from 'lucide-react';

interface FolderCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
}

const FolderCreationDialog: React.FC<FolderCreationDialogProps> = ({ 
  isOpen, 
  onClose, 
  onCreateFolder 
}) => {
  const [folderName, setFolderName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-obsidian border border-obsidian-border text-obsidian-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus size={18} />
            Create New Folder
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="bg-obsidian-gray border-obsidian-border text-obsidian-foreground"
              autoFocus
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-obsidian-border text-obsidian-foreground hover:bg-obsidian-hover"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-obsidian-purple hover:bg-obsidian-purple/90 text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FolderCreationDialog;
