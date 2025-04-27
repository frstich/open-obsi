import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react"; // Added useRef
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
  NodeProps, // <-- Add missing import
  BackgroundVariant,
  ReactFlowProvider, // Wrap with provider if using useReactFlow hook outside
  useReactFlow,
  XYPosition,
  Viewport, // Import Viewport type
  MarkerType, // Import MarkerType for default arrowheads
} from "reactflow";
import "reactflow/dist/style.css"; // Import reactflow styles
import {
  CanvasNodeType,
  CanvasEdgeType,
  CanvasNodeData,
  CanvasData, // Import CanvasData to access viewport type
} from "../../types/canvasTypes"; // Adjusted path
import CustomNode from "./CustomNode";
import CanvasToolbar from "./CanvasToolbar"; // Import the new toolbar
import { Note } from "../../context/NotesTypes"; // Adjusted path
import { useNotes } from "../../context/NotesContext"; // Adjusted path - use context directly
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button"; // Adjusted path
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Import Dialog components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { Input } from "@/components/ui/input"; // Import Input component
import { Label } from "@/components/ui/label"; // Import Label component
import { toast } from "sonner";

// Define handlers outside the component or ensure they are stable with useCallback
// These handlers will be passed down to the CustomNode wrapper

interface CanvasViewProps {
  note: Note; // Pass the full note object containing canvas data
}

const CanvasViewInner: React.FC = () => {
  const { activeNote, updateNote, notes: allNotes, setActiveNote } = useNotes(); // Add setActiveNote
  const { screenToFlowPosition, getViewport } = useReactFlow(); // Added getViewport

  // --- State ---
  const [nodes, setNodes] = useState<CanvasNodeType[]>(
    activeNote?.canvas_data?.nodes || []
  );
  const [edges, setEdges] = useState<CanvasEdgeType[]>(
    activeNote?.canvas_data?.edges || []
  );
  const [viewport, setViewport] = useState<Viewport | undefined>(
    activeNote?.canvas_data?.viewport
  );
  const [isNoteSelectOpen, setIsNoteSelectOpen] = useState(false);
  const [isImageUrlOpen, setIsImageUrlOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const lastClickPositionRef = useRef<XYPosition | null>(null); // Store click position

  // --- Node Handlers (defined after state, using useCallback for stability) ---
  const handleResizeNode = useCallback(
    (id: string, width: number, height: number) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, width, height }, // Update data width/height
              width, // Update top-level width/height for React Flow
              height,
            };
          }
          return node;
        })
      );
      // Save is triggered by useEffect watching nodes state
    },
    [setNodes]
  );

  const handleUpdateNodeLabel = useCallback(
    (id: string, label: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, label } };
          }
          return node;
        })
      );
      // Save is triggered by useEffect watching nodes state
    },
    [setNodes]
  );

  const handleNavigateToNote = useCallback(
    (noteId: string) => {
      const targetNote = allNotes.find((n) => n.id === noteId);
      if (targetNote) {
        setActiveNote(targetNote);
        toast.info(`Navigated to note: ${targetNote.title || noteId}`);
      } else {
        toast.error("Could not find the linked note.");
      }
    },
    [allNotes, setActiveNote]
  );

  // --- Effects ---
  // REMOVED useEffect that injected handlers into node.data

  // Update state if the active note changes externally
  useEffect(() => {
    if (activeNote?.type === "canvas") {
      // Initialize nodes directly from note data - handlers are passed via nodeTypes now
      const initialNodes = activeNote.canvas_data?.nodes || [];

      // Ensure edges have default data if missing from older saves
      const newEdges = (activeNote.canvas_data?.edges || []).map(
        (edge): CanvasEdgeType => ({
          ...edge,
          data: {
            lineStyle: edge.data?.lineStyle || "solid",
            color: edge.data?.color || "#b3b3b3",
            ...edge.data,
          },
          animated: edge.animated ?? false,
          markerEnd: edge.markerEnd ?? { type: MarkerType.ArrowClosed },
        })
      );

      setNodes(initialNodes); // Set nodes directly
      setEdges(newEdges);
      setViewport(activeNote.canvas_data?.viewport);
    } else {
      setNodes([]);
      setEdges([]);
      setViewport(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote?.id]); // Removed handler dependencies

  // --- Node Types Definition (using useMemo for stability) ---
  const nodeTypes: NodeTypes = useMemo(() => {
    // Wrapper component to inject handlers
    const CustomNodeWrapper: React.FC<NodeProps<CanvasNodeData>> = (props) => (
      <CustomNode
        {...props}
        // Pass handlers as direct props
        onResizeNode={handleResizeNode}
        onUpdateNodeLabel={handleUpdateNodeLabel}
        onNavigateToNote={handleNavigateToNote}
      />
    );
    CustomNodeWrapper.displayName = "CustomNodeWrapper"; // Add display name

    return {
      custom: CustomNodeWrapper, // Use the wrapper
    };
  }, [handleResizeNode, handleUpdateNodeLabel, handleNavigateToNote]); // Dependencies are the handlers

  // --- ReactFlow Handlers ---
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // Add default styles and data when connecting nodes
  const onConnect: OnConnect = useCallback(
    (connection) => {
      const newEdge: CanvasEdgeType = {
        ...connection,
        id: uuidv4(), // Ensure unique ID
        type: "default", // Or your custom edge type if you have one
        animated: false, // Default: not animated
        markerEnd: { type: MarkerType.ArrowClosed }, // Default arrowhead
        data: {
          lineStyle: "solid", // Default line style
          color: "#b3b3b3", // Default color (neutral gray)
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Capture viewport changes and update state
  const onMoveEnd = useCallback(
    (_, newViewport: Viewport) => {
      setViewport(newViewport);
      // Viewport state change will trigger the debounced save via the useEffect below
    },
    [setViewport] // Only depends on setViewport
  );

  // --- Saving ---
  // Define a type for the debounced save function including the timeoutId
  type DebouncedSaveFunction = {
    (
      currentNote: Note | null,
      updatedNodes: CanvasNodeType[],
      updatedEdges: CanvasEdgeType[],
      currentViewport: Viewport | undefined
    ): void;
    timeoutId: NodeJS.Timeout | null;
  };

  // Unified debounced save for ALL canvas changes (nodes, edges, viewport)
  const debouncedSaveCanvas = useMemo((): DebouncedSaveFunction => {
    let timeoutId: NodeJS.Timeout | null = null;
    let targetNoteId: string | null = null;

    // Save function now accepts the full canvas state
    const save = (
      currentNote: Note | null, // Pass the activeNote at the time of triggering
      updatedNodes: CanvasNodeType[],
      updatedEdges: CanvasEdgeType[],
      currentViewport: Viewport | undefined
    ) => {
      // Use the passed currentNote for checks and saving
      if (!currentNote || currentNote.type !== "canvas") return;

      if (timeoutId) clearTimeout(timeoutId);
      targetNoteId = currentNote.id; // Track which note we intend to save

      timeoutId = setTimeout(() => {
        // Check if the *current* activeNote still matches the one we intended to save
        // This prevents saving to the wrong note if the user switches notes quickly
        if (activeNote && activeNote.id === targetNoteId) {
          console.log("Saving canvas data:", {
            nodes: updatedNodes,
            edges: updatedEdges,
            viewport: currentViewport,
          }); // Debug log
          const noteToUpdate: Partial<Note> & { id: string } = {
            id: activeNote.id,
            type: activeNote.type, // Preserve note type
            canvas_data: {
              nodes: updatedNodes,
              edges: updatedEdges,
              viewport: currentViewport, // Save viewport along with nodes/edges
            },
            updated_at: new Date().toISOString(),
          };
          updateNote(noteToUpdate as Note);
        } else {
          console.log("Save cancelled: Active note changed."); // Debug log
        }
        timeoutId = null;
      }, 1000); // Debounce time
    };

    // Expose timeoutId for cleanup - Cast to the defined type
    (save as DebouncedSaveFunction).timeoutId = timeoutId;
    return save as DebouncedSaveFunction; // Return casted function
  }, [updateNote]); // Remove activeNote dependency, check inside timeout is sufficient

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      // Access timeoutId using the defined type
      const timeoutId = debouncedSaveCanvas.timeoutId;
      if (timeoutId) {
        clearTimeout(timeoutId);
        console.log("Save timeout cleared on unmount."); // Debug log
      }
    };
  }, [debouncedSaveCanvas]);

  // Trigger unified debounced save when nodes, edges, or viewport change
  useEffect(() => {
    // Only save if it's a canvas note and data has actually changed
    // (This check might be simplified, but helps prevent unnecessary saves on initial load)
    if (activeNote?.type === "canvas") {
      // Pass the current activeNote, nodes, edges, and viewport to the debounced save function
      debouncedSaveCanvas(activeNote, nodes, edges, viewport);
    }
    // This effect now triggers the save for *any* relevant state change
  }, [nodes, edges, viewport, activeNote, debouncedSaveCanvas]); // Add viewport and activeNote

  // --- Canvas Actions ---
  // Refactored addNode to accept type and data
  const addNode = useCallback(
    (
      nodeType: "text" | "note" | "image",
      data: Partial<CanvasNodeData> = {},
      position?: XYPosition // Optional position override
    ) => {
      const newNodeId = uuidv4();
      // Use provided position or calculate center of viewport
      const finalPosition =
        position ??
        screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 3,
        });

      let nodeData: CanvasNodeData;
      let nodeWidth: number | undefined = undefined; // Default width
      let nodeHeight: number | undefined = undefined; // Default height

      switch (nodeType) {
        case "note":
          nodeData = {
            type: "note",
            label: `Note: ${data.noteId || "Select Note"}`, // Placeholder label
            noteId: data.noteId,
            width: data.width || 250, // Increased default note width
            height: data.height || 200, // Increased default note height
          };
          nodeWidth = nodeData.width;
          nodeHeight = nodeData.height;
          break;
        case "image":
          nodeData = {
            type: "image",
            label: "Image", // Simple label
            imageUrl: data.imageUrl,
            width: data.width || 250, // Increased default image width
            height: data.height || 200, // Increased default image height
          };
          nodeWidth = nodeData.width;
          nodeHeight = nodeData.height;
          break;
        case "text":
        default:
          nodeData = {
            type: "text",
            label: data.label || "[Double-click to edit]", // Default placeholder text
            width: data.width || 200, // Default text width
            height: data.height || 100, // Default text height (sufficient for placeholder)
          };
          nodeWidth = nodeData.width;
          nodeHeight = nodeData.height;
          break;
      }

      const newNode: CanvasNodeType = {
        id: newNodeId,
        type: "custom", // Always use our custom node type wrapper
        position: finalPosition,
        data: {
          ...nodeData,
          // Handlers are no longer added here, they are passed via nodeTypes
        },
        width: nodeWidth, // Pass width for initial render
        height: nodeHeight, // Pass height for initial render
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes] // Removed nodes dependency, handlers are stable
  );

  // --- Toolbar Handlers ---
  const handleAddTextNode = useCallback(() => {
    // Use center of current viewport
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
    });
    addNode("text", { label: "New Text Node" }, center);
  }, [addNode, screenToFlowPosition]);

  const handleAddNoteNode = useCallback(() => {
    // Store click position or center if not available
    lastClickPositionRef.current = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
    });
    setSelectedNoteId(null); // Reset selection
    setIsNoteSelectOpen(true); // Open the dialog
  }, [screenToFlowPosition]);

  const handleAddImageNode = useCallback(() => {
    // Store click position or center if not available
    lastClickPositionRef.current = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
    });
    setImageUrl(""); // Reset image URL
    setIsImageUrlOpen(true); // Open the dialog
  }, [screenToFlowPosition]);

  // Handler for confirming note selection
  const confirmAddNoteNode = () => {
    if (selectedNoteId) {
      const selectedNote = allNotes.find((n) => n.id === selectedNoteId);
      addNode(
        "note",
        {
          noteId: selectedNoteId,
          label: `Note: ${selectedNote?.title || selectedNoteId}`,
        },
        lastClickPositionRef.current ?? undefined // Use stored position
      );
    }
    setIsNoteSelectOpen(false);
    setSelectedNoteId(null);
  };

  // Handler for confirming image URL
  const confirmAddImageNode = () => {
    if (imageUrl && imageUrl.trim() !== "") {
      addNode(
        "image",
        { imageUrl: imageUrl.trim() },
        lastClickPositionRef.current ?? undefined // Use stored position
      );
    } else {
      toast.error("Please enter a valid image URL.");
    }
    setIsImageUrlOpen(false);
    setImageUrl("");
  };

  // Process edges to add dynamic styles based on data - MOVED BEFORE EARLY RETURN
  const processedEdges = useMemo(() => {
    return edges.map((edge) => {
      const style: React.CSSProperties = {
        stroke: edge.data?.color || "#b3b3b3", // Default color if not set
      };
      if (edge.data?.lineStyle === "dashed") {
        style.strokeDasharray = "5 5";
      } else if (edge.data?.lineStyle === "dotted") {
        style.strokeDasharray = "1 5";
      }
      // Ensure marker color matches edge color if not explicitly set
      const markerEnd =
        typeof edge.markerEnd === "object"
          ? { ...edge.markerEnd, color: edge.data?.color || "#b3b3b3" }
          : edge.markerEnd;

      return {
        ...edge,
        style,
        markerEnd, // Apply potentially updated marker
      };
    });
  }, [edges]);

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
        edges={processedEdges} // Use processed edges with styles
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes} // Use the memoized nodeTypes with the wrapper
        // Use defaultViewport instead of fitView to restore saved state
        defaultViewport={activeNote?.canvas_data?.viewport}
        // fitView // Remove fitView
        // fitViewOptions={{ padding: 0.2 }} // Remove fitViewOptions
        className="bg-obsidian" // Use obsidian background
        // Add a minZoom to prevent zooming out too far
        minZoom={0.1}
      >
        <Controls className="[&>button]:bg-obsidian-gray [&>button]:border-obsidian-border [&>button:hover]:bg-obsidian-hover [&_path]:fill-obsidian-foreground" />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#4a4a4a"
        />

        {/* Add the new Toolbar */}
        <CanvasToolbar
          onAddTextNode={handleAddTextNode}
          onAddNoteNode={handleAddNoteNode}
          onAddImageNode={handleAddImageNode}
        />

        {/* --- Dialogs --- */}

        {/* Note Selection Dialog */}
        <Dialog open={isNoteSelectOpen} onOpenChange={setIsNoteSelectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Note to Embed</DialogTitle>
              <DialogDescription>
                Choose an existing note to embed as a node on the canvas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Select
                onValueChange={setSelectedNoteId}
                value={selectedNoteId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a note..." />
                </SelectTrigger>
                <SelectContent>
                  {allNotes
                    .filter(
                      (note) =>
                        note.id !== activeNote?.id && note.type !== "canvas"
                    ) // Exclude current canvas and other canvases
                    .map((note) => (
                      <SelectItem key={note.id} value={note.id}>
                        {note.title || `Note ${note.id.substring(0, 6)}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsNoteSelectOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={confirmAddNoteNode} disabled={!selectedNoteId}>
                Add Note Node
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image URL Input Dialog */}
        <Dialog open={isImageUrlOpen} onOpenChange={setIsImageUrlOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Image Node</DialogTitle>
              <DialogDescription>
                Enter the URL of the image you want to add to the canvas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="col-span-3"
                  placeholder="https://example.com/image.png"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsImageUrlOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={confirmAddImageNode} disabled={!imageUrl.trim()}>
                Add Image Node
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
