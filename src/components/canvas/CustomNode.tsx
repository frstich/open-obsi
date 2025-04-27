import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { CanvasNodeData } from "../../types/canvasTypes"; // Adjusted path
import { cn } from "../../lib/utils"; // Adjusted path

const CustomNode: React.FC<NodeProps<CanvasNodeData>> = ({
  data,
  isConnectable,
  selected,
}) => {
  return (
    <div
      className={cn(
        "bg-obsidian-lightgray/10 border border-obsidian-border rounded-md shadow-md p-2 text-xs text-obsidian-foreground min-w-[100px] min-h-[40px]",
        selected ? "border-obsidian-purple ring-1 ring-obsidian-purple" : ""
      )}
    >
      {/* Connection Handles (adjust positions as needed) */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-obsidian-purple"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-obsidian-purple"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!bg-obsidian-purple"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!bg-obsidian-purple"
      />

      {/* Node Content */}
      <div>{data.label || "Card"}</div>
    </div>
  );
};

export default memo(CustomNode);
