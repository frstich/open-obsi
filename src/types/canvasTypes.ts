/**
 * Represents an item (node) on the canvas.
 */
export interface CanvasNode {
  /** Unique identifier for the node. */
  id: string;
  /** X-coordinate of the node's top-left corner. */
  x: number;
  /** Y-coordinate of the node's top-left corner. */
  y: number;
  /** Width of the node. */
  width: number;
  /** Height of the node. */
  height: number;
  /** Type of the node (e.g., 'note', 'file', 'card'). */
  type: string;
  /** Content associated with the node (initially a string). */
  content: string; // Changed from unknown to string for initial implementation
}

/**
 * Represents a connection (edge) between two nodes on the canvas.
 */
export interface CanvasEdge {
  /** Unique identifier for the edge. */
  id: string;
  /** ID of the source CanvasNode. */
  sourceNodeId: string;
  /** ID of the target CanvasNode. */
  targetNodeId: string;
  /** Optional label for the connection. */
  label?: string;
}
