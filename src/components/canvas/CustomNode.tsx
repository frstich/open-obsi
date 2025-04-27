import React, { memo, useMemo, useState, useRef, useEffect } from "react"; // Added useState, useRef, useEffect
import {
  Handle,
  Position,
  NodeProps,
  NodeResizeControl,
  useReactFlow,
  Node,
} from "reactflow"; // Added useReactFlow, Node
import { NodeResizer, ResizeParams, OnResize } from "@reactflow/node-resizer"; // Import OnResize type
import "@reactflow/node-resizer/dist/style.css";
import { CanvasNodeData } from "../../types/canvasTypes";
import { Textarea } from "../ui/textarea"; // Import Textarea
import { cn } from "../../lib/utils";
import { useNotes } from "../../context/NotesContext";
import { FileText, Image as ImageIcon } from "lucide-react";

// Define the props including the handlers
interface CustomNodeProps extends NodeProps<CanvasNodeData> {
  onResizeNode?: (id: string, width: number, height: number) => void;
  onUpdateNodeLabel?: (id: string, label: string) => void;
  onNavigateToNote?: (noteId: string) => void;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  id,
  data,
  isConnectable,
  selected,
  dragging,
  // Destructure handlers from props
  onResizeNode,
  onUpdateNodeLabel,
  onNavigateToNote,
}) => {
  const { notes, setActiveNote } = useNotes();
  const { setNodes } = useReactFlow();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data.label || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      });
    }
  }, [isEditing]);

  // REMOVED useEffect that disabled node dragging while editing text

  // Find the linked note if type is 'note'
  const linkedNote = useMemo(() => {
    if (data.type === "note" && data.noteId) {
      return notes.find((note) => note.id === data.noteId);
    }
    return null;
  }, [data.type, data.noteId, notes]);

  // --- Edit Handling ---
  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (data.type === "text") {
      setEditText(data.label || "");
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editText !== data.label) {
      // Call handler directly from props
      onUpdateNodeLabel?.(id, editText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditText(event.target.value);
  };

  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    }
  };

  // --- Content Rendering ---
  const renderContent = () => {
    switch (data.type) {
      case "note":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <FileText className="w-4 h-4 mb-1 text-obsidian-lightgray" />
            <span className="font-medium truncate max-w-[90%]">
              {linkedNote?.title || data.noteId || "Note"}
            </span>
          </div>
        );
      case "image":
        return data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.label || "Canvas Image"}
            className="object-contain w-full h-full rounded"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
              e.currentTarget.alt = "Image failed to load";
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-obsidian-lightgray">
            <ImageIcon className="w-4 h-4 mb-1" />
            <span>No Image URL</span>
          </div>
        );
      default: // Handles 'text'
        return isEditing ? (
          <Textarea
            ref={textareaRef}
            value={editText}
            onChange={handleTextareaChange}
            onBlur={handleSave}
            onKeyDown={handleTextareaKeyDown}
            className="absolute inset-0 w-full h-full p-2 text-xs bg-obsidian-background text-obsidian-foreground border border-obsidian-purple ring-1 ring-obsidian-purple rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-obsidian-purple overflow-auto break-words z-10"
            style={{
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
            }}
          />
        ) : (
          <div
            className="w-full h-full p-2 overflow-auto break-words cursor-text"
            onDoubleClick={handleDoubleClick}
          >
            {data.label || "[Double-click to edit]"}
          </div>
        );
    }
  };

  // Define default dimensions (can be removed if handled solely by data)
  // const defaultWidth = data.type === "image" ? 150 : 100;
  // const defaultHeight = data.type === "image" ? 100 : 40;

  // Handle resize event
  const handleResize: OnResize = (_event, params) => {
    // Call handler directly from props
    onResizeNode?.(id, params.width, params.height);
  };

  const handleNodeClick = () => {
    if (data.type === "note" && data.noteId) {
      // Call handler directly from props
      onNavigateToNote?.(data.noteId);
    }
  };

  return (
    <>
      {/* NodeResizer component */}
      <NodeResizer
        isVisible={selected}
        minWidth={50}
        minHeight={30}
        onResize={handleResize}
        keepAspectRatio={data.type === "image"}
        lineClassName="border-obsidian-purple !border-opacity-50" // Style resize line
        handleClassName="bg-obsidian-purple h-2 w-2 rounded-full border-2 border-obsidian-background" // Style resize handles
      />
      {/* Optional: Individual resize controls if needed */}
      {/* <NodeResizeControl position="top-left" style={{ background: 'blue' }} /> */}

      {/* Main node container */}
      <div
        onClick={handleNodeClick} // Add onClick handler
        className={cn(
          "bg-obsidian-lightgray/10 border border-obsidian-border rounded-md shadow-md text-xs text-obsidian-foreground flex items-center justify-center relative w-full h-full", // Ensure div fills the resizer area
          selected ? "border-obsidian-purple ring-1 ring-obsidian-purple" : "",
          data.type === "image" ? "p-0 overflow-hidden" : "p-0", // Remove padding, content div handles it
          data.type === "note"
            ? "cursor-pointer hover:bg-obsidian-lightgray/20"
            : "", // Add pointer cursor for note nodes
          isEditing && "border-transparent ring-0" // Hide border/ring when editing to avoid double border
        )}
        style={
          {
            // Width and height are controlled by the NodeResizer wrapper
          }
        }
      >
        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="!bg-obsidian-purple !h-2 !w-2 !-translate-y-1"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="!bg-obsidian-purple !h-2 !w-2 !translate-y-1"
        />
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="!bg-obsidian-purple !h-2 !w-2 !-translate-x-1"
        />
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className="!bg-obsidian-purple !h-2 !w-2 !translate-x-1"
        />

        {/* Node Content */}
        {renderContent()}
      </div>
    </>
  );
};

export default memo(CustomNode);
