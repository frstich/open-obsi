import type { Node, Edge } from "reactflow";

// Extend reactflow types or create specific types

/**
 * Represents the data payload for a custom canvas node.
 * Add any specific properties your node needs here.
 */
export interface CanvasNodeData {
  label: string; // Example: using label for content initially
  // Add other properties like color, linked note ID, etc. later
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
export type CanvasEdgeType = Edge;
// If you need extra top-level props beyond reactflow's Edge:
// export interface CustomCanvasEdge extends Edge {
//  myCustomEdgeProp?: string;
// }

/**
 * Structure for storing canvas data within a Note.
 */
export interface CanvasData {
  nodes: CanvasNodeType[];
  edges: CanvasEdgeType[];
  // Optional: Store viewport info (zoom, position)
  // viewport?: Viewport;
}
