import React from 'react';

interface CodeOutputProps {
  code: string;
}

const CodeOutput: React.FC<CodeOutputProps> = ({ code }) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };
  
  return (
    <div className="code-output-container">
      <div className="code-actions">
        <button onClick={handleCopyCode}>
          Copy to Clipboard
        </button>
      </div>
      <pre className="code-output">
        {code}
      </pre>
    </div>
  );
};

export default CodeOutput; 