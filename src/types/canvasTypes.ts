import type { Node, Edge, Viewport } from "reactflow";

// Extend reactflow types or create specific types

/**
 * Represents the data payload for a custom canvas node.
 * Add any specific properties your node needs here.
 */
export type CanvasNodeTypeValue = "text" | "note" | "image";

export interface CanvasNodeData {
  type: CanvasNodeTypeValue;
  // Data specific to node type
  label?: string; // For 'text' type
  noteId?: string; // For 'note' type
  imageUrl?: string; // For 'image' type
  // Common properties (optional)
  // color?: string;
  width?: number; // Optional width for resizing
  height?: number; // Optional height for resizing

  // Handlers passed from CanvasView
  onResizeNode?: (id: string, width: number, height: number) => void;
  onUpdateNodeLabel?: (id: string, label: string) => void;
  onNavigateToNote?: (noteId: string) => void;
}

/**
 * Represents a node on the canvas, compatible with ReactFlow.
 */
export type CanvasNodeType = Node<CanvasNodeData>;
// If you need extra top-level props beyond reactflow's Node:
// export interface CustomCanvasNode extends Node<CanvasNodeData> {
//   myCustomProp?: string;
// }

/**
 * Represents a connection (edge) between two nodes, compatible with ReactFlow.
 */
// Define the structure for custom data associated with edges
export interface CustomEdgeData {
  lineStyle?: "solid" | "dashed" | "dotted";
  color?: string;
  // Note: 'animated' and 'markerEnd' are standard Edge props in React Flow,
  // but we can include them here if we want to strongly type defaults or specific logic later.
  // For now, we'll rely on standard Edge props for these.
}

/**
 * Represents a connection (edge) between two nodes, compatible with ReactFlow,
 * potentially carrying custom data.
 */
export type CanvasEdgeType = Edge<CustomEdgeData>; // Use Edge generic with our custom data type

/**
 * Structure for storing canvas data within a Note.
 */
export interface CanvasData {
  nodes: CanvasNodeType[];
  edges: CanvasEdgeType[]; // Use the correctly typed Edge
  // Optional: Store viewport info (zoom, position)
  viewport?: Viewport;
}
