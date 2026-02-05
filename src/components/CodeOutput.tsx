import React from 'react';
import { toast } from '../utils/toast';

interface CodeOutputProps {
  code: string;
}

const CodeOutput: React.FC<CodeOutputProps> = ({ code }) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast("Minified JSON copied!");
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