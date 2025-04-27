import React, { useState, MouseEvent, WheelEvent, useEffect } from "react"; // Added WheelEvent, useEffect
import { CanvasNode, CanvasEdge } from "../types/canvasTypes";

/**
 * CanvasView component provides the main container for the canvas-like interface.
 * It sets up a basic styled area where canvas elements will be rendered.
 */
export const CanvasView: React.FC = () => {
  // Initialize state for nodes
  const [nodes, setNodes] = useState<CanvasNode[]>([
    {
      id: "node-1",
      x: 50,
      y: 50,
      width: 150,
      height: 80,
      type: "card",
      content: "Sample Card 1",
    },
    {
      id: "node-2",
      x: 250,
      y: 150,
      width: 150,
      height: 80,
      type: "card",
      content: "Sample Card 2",
    },
    {
      id: "node-3",
      x: 450,
      y: 80,
      width: 150,
      height: 80,
      type: "card",
      content: "Sample Card 3",
    },
  ]);

  // Initialize state for edges
  const [edges, setEdges] = useState<CanvasEdge[]>([
    { id: "edge-1", sourceNodeId: "node-1", targetNodeId: "node-2" },
    { id: "edge-2", sourceNodeId: "node-2", targetNodeId: "node-3" },
  ]);

  // State for drag operation
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null
  );

  // State for viewport transform (zoom/pan)
  const [scale, setScale] = useState<number>(1);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);

  // State for panning operation
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(
    null
  );

  // State for selected node
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Renamed from handleMouseDown to avoid conflict
  const handleNodeMouseDown = (
    e: MouseEvent<HTMLDivElement>,
    nodeId: string
  ) => {
    e.stopPropagation(); // Prevent triggering container pan
    // e.preventDefault(); // Optional: Prevent default drag behavior if needed
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setSelectedNodeId(nodeId); // Select the node on click
    setDraggingNodeId(nodeId);
    // Calculate offset relative to the *scaled* and *translated* position
    // Get container's bounding box once
    const container = e.currentTarget.closest(".relative.flex-1");
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    // Convert mouse position to canvas coordinates
    const canvasX = (mouseX - translateX) / scale;
    const canvasY = (mouseY - translateY) / scale;

    setDragOffset({
      x: canvasX - node.x,
      y: canvasY - node.y,
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    // Use currentTarget to ensure calculations are relative to the element the handler is attached to
    const currentTarget = e.currentTarget as HTMLElement;
    const containerRect = currentTarget.getBoundingClientRect();

    if (isPanning && panStart) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      // Panning doesn't need scaling adjustment for delta
      setTranslateX((prev) => prev + dx);
      setTranslateY((prev) => prev + dy);
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (draggingNodeId && dragOffset) {
      // Adjust mouse position based on container offset
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;

      // Convert mouse coordinates to canvas coordinates
      const canvasX = (mouseX - translateX) / scale;
      const canvasY = (mouseY - translateY) / scale;

      const newX = canvasX - dragOffset.x;
      const newY = canvasY - dragOffset.y;

      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === draggingNodeId ? { ...node, x: newX, y: newY } : node
        )
      );
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
    }
    if (draggingNodeId) {
      setDraggingNodeId(null);
      setDragOffset(null);
    }
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001; // Adjust sensitivity
    const newScale = Math.min(Math.max(scale + scaleAmount, 0.1), 3); // Clamp scale

    // --- Simple zoom towards top-left ---
    // To zoom towards the mouse, we need to adjust translateX/Y
    // Calculate mouse position relative to the container
    const containerRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    // Calculate mouse position in canvas coordinates BEFORE zoom
    const mouseCanvasX_before = (mouseX - translateX) / scale;
    const mouseCanvasY_before = (mouseY - translateY) / scale;

    // Calculate mouse position in canvas coordinates AFTER zoom (if scale were applied)
    // This point should map to the same screen coordinates (mouseX, mouseY)
    // mouseX = newTranslateX + mouseCanvasX_before * newScale;
    // mouseY = newTranslateY + mouseCanvasY_before * newScale;

    // Calculate the required translation shift
    const newTranslateX = mouseX - mouseCanvasX_before * newScale;
    const newTranslateY = mouseY - mouseCanvasY_before * newScale;

    setScale(newScale);
    setTranslateX(newTranslateX);
    setTranslateY(newTranslateY);
    // --- End Zoom towards mouse ---
  };

  const handleContainerMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Only pan if clicking directly on the container background
    if (e.target === e.currentTarget) {
      setSelectedNodeId(null); // Deselect node when clicking background
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.currentTarget.style.cursor = "grabbing"; // Change cursor immediately
    }
  };

  const handleContainerMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    // Reset cursor if panning was active
    if (isPanning) {
      e.currentTarget.style.cursor = "grab";
    }
    handleMouseUp(); // Call the general mouse up logic
  };

  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    // Only add node if double-clicking directly on the container background
    if (e.target === e.currentTarget) {
      const containerRect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;

      // Convert viewport coordinates to canvas coordinates
      const canvasX = (mouseX - translateX) / scale;
      const canvasY = (mouseY - translateY) / scale;

      const newNode: CanvasNode = {
        id: `node-${Date.now()}`, // Simple unique ID generation
        x: canvasX,
        y: canvasY,
        width: 150, // Default width
        height: 100, // Default height
        type: "card", // Default type
        content: "New Card", // Default content
      };

      setNodes((prevNodes) => [...prevNodes, newNode]);
    }
  };

  // Effect for handling keydown events (Delete/Backspace)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        selectedNodeId &&
        (event.key === "Delete" || event.key === "Backspace")
      ) {
        // Remove the selected node
        setNodes((currentNodes) =>
          currentNodes.filter((node) => node.id !== selectedNodeId)
        );
        // Remove edges connected to the selected node
        setEdges((currentEdges) =>
          currentEdges.filter(
            (edge) =>
              edge.sourceNodeId !== selectedNodeId &&
              edge.targetNodeId !== selectedNodeId
          )
        );
        // Deselect
        setSelectedNodeId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedNodeId, setNodes, setEdges]); // Dependencies: re-run if selectedNodeId or setters change

  return (
    // Added wheel and container mouse down/up handlers
    <div
      className="relative flex-1 w-full h-full bg-muted/40 border border-dashed border-border overflow-hidden cursor-grab" // Default cursor grab
      onMouseDown={handleContainerMouseDown} // Use specific handler for container clicks
      onMouseMove={handleMouseMove}
      onMouseUp={handleContainerMouseUp} // Use specific handler to reset cursor
      onMouseLeave={handleMouseUp} // Also stop dragging/panning if mouse leaves
      onWheel={handleWheel} // Add wheel handler for zoom
      onDoubleClick={handleDoubleClick} // Add double-click handler
    >
      {/* Wrapper div for applying transform */}
      <div
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transformOrigin: "0 0", // Scale from top-left corner
          width: "100%", // Ensure wrapper takes space for content positioning
          height: "100%",
        }}
      >
        {/* Map over nodes and render them */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute bg-card rounded p-2 shadow ${
              draggingNodeId === node.id ? "cursor-grabbing" : "cursor-grab" // Conditional cursor for node
            } ${
              selectedNodeId === node.id
                ? "border-2 border-primary"
                : "border border-border"
            }`} // Added selection border and adjusted base border
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: `${node.width}px`,
              height: `${node.height}px`,
              userSelect: "none", // Prevent text selection during drag
            }}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)} // Use specific node handler
          >
            {node.content} {/* Display node content */}
          </div>
        ))}

        {/* SVG container for rendering edges */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            // Make SVG large enough to contain potentially transformed content
            // This might need adjustment based on expected zoom/pan range
            width: `calc(100% / ${scale} + ${Math.abs(translateX / scale)}px)`,
            height: `calc(100% / ${scale} + ${Math.abs(translateY / scale)}px)`,
            pointerEvents: "none", // Make SVG non-interactive
            zIndex: 0, // Ensure SVG is behind nodes
            // Apply inverse transform to SVG content if needed, or adjust coordinates
          }}
          // viewBox might be useful here depending on coordinate system needs
        >
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.sourceNodeId);
            const targetNode = nodes.find((n) => n.id === edge.targetNodeId);

            if (!sourceNode || !targetNode) {
              return null; // Skip rendering if nodes are not found
            }

            // Calculate center points for the line (relative to the transformed space)
            const x1 = sourceNode.x + sourceNode.width / 2;
            const y1 = sourceNode.y + sourceNode.height / 2;
            const x2 = targetNode.x + targetNode.width / 2;
            const y2 = targetNode.y + targetNode.height / 2;

            return (
              <line
                key={edge.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor" // Use theme's text color
                strokeWidth={2 / scale} // Adjust stroke width based on scale
                // Vector-effect non-scaling-stroke might be useful if supported
                // style={{ vectorEffect: 'non-scaling-stroke' }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
