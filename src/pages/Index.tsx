
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import CommandPalette from '../components/CommandPalette';

const Index = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Listen for command palette keyboard shortcut (Ctrl+P or Cmd+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Fix for Windows: Use keyCode as a fallback for older browsers
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  // Expose command palette to global scope for easier access
  useEffect(() => {
    const openCommandPalette = () => setCommandPaletteOpen(true);
    (window as any).openCommandPalette = openCommandPalette;
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggle={toggleSidebar} 
        openCommandPalette={() => setCommandPaletteOpen(true)}
      />
      <Editor isCollapsed={isSidebarCollapsed} />

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

export default Index;
