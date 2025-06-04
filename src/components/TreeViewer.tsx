import React from 'react';

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  description?: string;
  children?: FigmaNode[];
  properties?: Record<string, any>;
}

interface TreeViewerProps {
  node: FigmaNode;
  depth?: number;
}

const TypeColorMap: Record<string, string> = {
  FRAME: '#2196F3',      // Blue
  COMPONENT: '#4CAF50',  // Green
  COMPONENT_SET: '#9C27B0', // Purple
  TEXT: '#FF9800',       // Orange
  INSTANCE: '#F44336',   // Red
  GROUP: '#607D8B',      // Blue Grey
  RECTANGLE: '#795548',  // Brown
  ELLIPSE: '#FF5722',    // Deep Orange
  VECTOR: '#9E9E9E',     // Grey
  LINE: '#BDBDBD',       // Light Grey
  DEFAULT: '#424242'     // Dark Grey
};

const TreeViewer: React.FC<TreeViewerProps> = ({ node, depth = 0 }) => {
  const getTypeColor = (type: string) => {
    return TypeColorMap[type] || TypeColorMap.DEFAULT;
  };
  
  // Set max depth to prevent too deep nesting
  const maxDepth = 10;
  
  // Basic style for the node box
  const boxStyle: React.CSSProperties = {
    border: `2px solid ${getTypeColor(node.type)}`,
    borderRadius: '4px',
    padding: '10px',
    margin: '5px',
    backgroundColor: `${getTypeColor(node.type)}22`, // Add transparency
    overflow: 'hidden',
    minHeight: depth > maxDepth ? '30px' : 'auto',
    position: 'relative'
  };
  
  // Style for node header
  const headerStyle: React.CSSProperties = {
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: `${Math.max(16 - depth, 11)}px`, // Decrease font size with depth
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };
  
  // Style for node type badge
  const typeBadgeStyle: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: getTypeColor(node.type),
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    marginLeft: '5px'
  };
  
  // Style for node children container
  const childrenStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '10px'
  };
  
  // If depth is too deep, just show a simplified representation
  if (depth > maxDepth) {
    return (
      <div style={boxStyle}>
        <div style={headerStyle}>
          {node.name}
          <span style={typeBadgeStyle}>{node.type}</span>
        </div>
        <div style={{ fontSize: '10px' }}>+ more nested components</div>
      </div>
    );
  }
  
  return (
    <div style={boxStyle}>
      <div style={headerStyle}>
        {node.name}
        <span style={typeBadgeStyle}>{node.type}</span>
      </div>
      
      {node.children && node.children.length > 0 && (
        <div style={childrenStyle}>
          {node.children.map((child) => (
            <TreeViewer 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeViewer; 