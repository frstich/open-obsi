import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
  BackgroundVariant,
  ReactFlowProvider, // Wrap with provider if using useReactFlow hook outside
  useReactFlow,
  XYPosition,
} from "reactflow";
import "reactflow/dist/style.css"; // Import reactflow styles
import {
  CanvasNodeType,
  CanvasEdgeType,
  CanvasNodeData,
} from "../../types/canvasTypes"; // Adjusted path
import CustomNode from "./CustomNode";
import { Note } from "../../context/NotesTypes"; // Adjusted path
import { useNotes } from "../../context/NotesContext"; // Adjusted path - use context directly
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button"; // Adjusted path
import { PlusSquare } from "lucide-react";
import { toast } from "sonner";

// Define node types for ReactFlow
const nodeTypes: NodeTypes = {
  custom: CustomNode, // Map 'custom' type to our CustomNode component
  // Add other node types here if needed
};

interface CanvasViewProps {
  note: Note; // Pass the full note object containing canvas data
}

const CanvasViewInner: React.FC = () => {
  const { activeNote, updateNote } = useNotes();
  const { screenToFlowPosition } = useReactFlow(); // Hook for converting screen coords to flow coords

  // State for nodes and edges, initialized from activeNote
  const [nodes, setNodes] = useState<CanvasNodeType[]>(
    activeNote?.canvas_data?.nodes || []
  );
  const [edges, setEdges] = useState<CanvasEdgeType[]>(
    activeNote?.canvas_data?.edges || []
  );

  // Update state if the active note changes externally
  useEffect(() => {
    // Immediately update state when activeNote changes
    if (activeNote?.type === "canvas") {
      const newNodes = activeNote.canvas_data?.nodes || [];
      const newEdges = activeNote.canvas_data?.edges || [];

      // Force state update on note change
      setNodes(newNodes);
      setEdges(newEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [activeNote?.id]); // Only react to note ID changes

  // --- ReactFlow Handlers ---
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // --- Saving ---
  // Debounced save for canvas changes with cleanup and note tracking
  const debouncedSaveCanvas = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let targetNoteId: string | null = null;

    const save = (
      updatedNodes: CanvasNodeType[],
      updatedEdges: CanvasEdgeType[]
    ) => {
      if (!activeNote || activeNote.type !== "canvas") return;

      if (timeoutId) clearTimeout(timeoutId);
      targetNoteId = activeNote.id; // Track which note we're saving

      timeoutId = setTimeout(() => {
        // Only save if we're still on the same note
        if (activeNote && activeNote.id === targetNoteId) {
          // Update only canvas_data to prevent overwrites
          const noteToUpdate: Partial<Note> & { id: string } = {
            id: activeNote.id,
            type: activeNote.type, // Preserve note type
            canvas_data: {
              nodes: updatedNodes,
              edges: updatedEdges,
            },
            updated_at: new Date().toISOString(),
          };
          updateNote(noteToUpdate as Note);
        }
        timeoutId = null;
      }, 1000); // Reduced debounce time for better responsiveness
    };

    save.timeoutId = timeoutId;
    return save;
  }, [activeNote, updateNote]);

  // Cleanup timeout on unmount or note change
  useEffect(() => {
    return () => {
      const timeoutId = (
        debouncedSaveCanvas as { timeoutId: NodeJS.Timeout | null }
      ).timeoutId;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [debouncedSaveCanvas]);

  // Trigger save when nodes or edges change
  useEffect(() => {
    // Check if the current state differs from the initial activeNote state
    // This prevents saving immediately on load or if the note was updated externally
    if (
      activeNote?.canvas_data &&
      (JSON.stringify(nodes) !== JSON.stringify(activeNote.canvas_data.nodes) ||
        JSON.stringify(edges) !== JSON.stringify(activeNote.canvas_data.edges))
    ) {
      debouncedSaveCanvas(nodes, edges);
    }
  }, [nodes, edges, activeNote?.canvas_data, debouncedSaveCanvas]);

  // --- Canvas Actions ---
  const addNode = useCallback(() => {
    const newNodeId = uuidv4();
    // Position the new node in the center of the current view
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 3, // Adjust y-position slightly higher
    });

    const newNode: CanvasNodeType = {
      id: newNodeId,
      type: "custom", // Use our custom node type
      position,
      data: { label: `New Card ${nodes.length + 1}` }, // Initial data
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, nodes, setNodes]);

  if (!activeNote || activeNote.type !== "canvas") {
    return (
      <div className="flex-1 flex items-center justify-center text-obsidian-lightgray">
        Select or create a canvas note.
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView // Adjust initial view
        fitViewOptions={{ padding: 0.2 }}
        className="bg-obsidian" // Use obsidian background
      >
        <Controls className="[&>button]:bg-obsidian-gray [&>button]:border-obsidian-border [&>button:hover]:bg-obsidian-hover [&_path]:fill-obsidian-foreground" />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#4a4a4a"
        />

        {/* Add UI Elements like a button to add nodes */}
        <div className="absolute top-2 left-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={addNode}
            className="bg-obsidian-gray border-obsidian-border hover:bg-obsidian-hover hover:border-obsidian-purple"
          >
            <PlusSquare className="h-4 w-4 mr-2" /> Add Card
          </Button>
        </div>
      </ReactFlow>
    </div>
  );
};

// Wrap the main component logic with ReactFlowProvider
const CanvasView: React.FC<CanvasViewProps> = ({ note }) => {
  // We might not need the note prop directly if CanvasViewInner uses useNotes()
  // but keeping it can be useful for potential future optimizations.
  return (
    <ReactFlowProvider>
      <CanvasViewInner />
    </ReactFlowProvider>
  );
};

export default CanvasView;
