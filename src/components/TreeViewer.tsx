import React from 'react';

// Interface matching our Compressed format
interface CompressedNode {
  n: string;   // name
  t: string;   // type
  c?: CompressedNode[]; // children
  v?: string;  // characters/value
  id?: string;
  [key: string]: any;
}

interface TreeViewerProps {
  node: CompressedNode;
  depth?: number;
}

const TypeColorMap: Record<string, string> = {
  FR: '#2196F3',      // Frame
  TX: '#FF9800',      // Text
  IC: '#9E9E9E',      // Icon/Vector
  RE: '#795548',      // Rectangle
  DEFAULT: '#424242'
};

const TreeViewer: React.FC<TreeViewerProps> = ({ node, depth = 0 }) => {
  const getTypeColor = (type: string) => {
    return TypeColorMap[type] || TypeColorMap.DEFAULT;
  };
  
  const maxDepth = 10;
  
  const boxStyle: React.CSSProperties = {
    border: `1.5px solid ${getTypeColor(node.t)}`,
    borderRadius: '6px',
    padding: '8px',
    margin: '4px 0',
    backgroundColor: `${getTypeColor(node.t)}10`, // Subtle transparency
    position: 'relative',
    transition: 'all 0.2s ease'
  };
  
  const headerStyle: React.CSSProperties = {
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: `${Math.max(14 - depth * 0.5, 11)}px`,
  };
  
  const typeBadgeStyle: React.CSSProperties = {
    backgroundColor: getTypeColor(node.t),
    color: 'white',
    padding: '1px 5px',
    borderRadius: '3px',
    fontSize: '9px',
    textTransform: 'uppercase'
  };

  const textPreviewStyle: React.CSSProperties = {
    fontStyle: 'italic',
    color: '#666',
    fontSize: '11px',
    marginLeft: '10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px'
  };
  
  if (depth > maxDepth) {
    return <div style={{ fontSize: '10px', padding: '5px' }}>... (Max Depth)</div>;
  }
  
  return (
    <div style={boxStyle}>
      <div style={headerStyle}>
        <span style={typeBadgeStyle}>{node.t}</span>
        <span>{node.n}</span>
        {node.v && <span style={textPreviewStyle}>"{node.v}"</span>}
      </div>
      
      {/* Use node.c instead of node.children */}
      {node.c && node.c.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          marginLeft: '12px',
          marginTop: '6px',
          borderLeft: '1px dashed #ccc',
          paddingLeft: '8px'
        }}>
          {node.c.map((child, i) => (
            <TreeViewer 
              key={`${child.n}-${i}`} 
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