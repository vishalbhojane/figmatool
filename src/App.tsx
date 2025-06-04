import React, { useState, useEffect } from 'react';
import FigmaInput from './components/FigmaInput';
import CodeOutput from './components/CodeOutput';
import figmaService from './services/figmaService';
import TreeViewer from './components/TreeViewer';
import './App.css';

// Interface for the Figma component tree
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  description?: string;
  children?: FigmaNode[];
  properties?: Record<string, any>;
}

const FIGMA_TOKEN_KEY = 'figma_api_token';

const App: React.FC = () => {
  const [figmaUrl, setFigmaUrl] = useState('https://www.figma.com/design/HTTCsDIPLr6vLpFA4o4QUM/SSTesting?node-id=404-206&t=VBR6lDJAhk9S2f95-4');
  const [figmaToken, setFigmaToken] = useState('');
  const [componentTree, setComponentTree] = useState<FigmaNode | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem(FIGMA_TOKEN_KEY);
    if (savedToken) {
      setFigmaToken(savedToken);
    }
  }, []);
  
  const handleSaveToken = () => {
    if (figmaToken.trim()) {
      localStorage.setItem(FIGMA_TOKEN_KEY, figmaToken.trim());
      alert('Figma API token saved successfully!');
    } else {
      alert('Please enter a valid token before saving.');
    }
  };
  
  const handleClearToken = () => {
    localStorage.removeItem(FIGMA_TOKEN_KEY);
    setFigmaToken('');
    alert('Figma API token cleared!');
  };
  
  const handleFetchComponents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setGeneratedCode('')
      setComponentTree(null)
      
      // Parse the Figma URL to get file ID and node ID
      const urlInfo = figmaService.parseFigmaUrl(figmaUrl);
      
      if (!urlInfo.fileId) {
        throw new Error('Invalid Figma URL. Please provide a valid Figma file URL.');
      }
      
      console.log('Fetching from Figma:', urlInfo);
      
      // Fetch the Figma file data, including the node ID if available
      const figmaData = await figmaService.fetchFigmaFile(
        urlInfo.fileId, 
        figmaToken,
        urlInfo.nodeId
      );
      
      // Extract the component tree structure
      const tree = figmaService.extractComponentTree(figmaData);
      console.log('tree', tree);
      
      if (tree) {
        setComponentTree(tree);
      } else {
        setError('No components found. Try a different node or file.');
        setComponentTree(null);
      }
    } catch (err) {
      console.error('Error fetching components:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch components');
      setComponentTree(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateCode = () => {
    // Use the component tree to generate code
    console.log('Component tree for code generation:', componentTree);
    
    // We would feed the component tree to an LLM for code generation
    // For now, just show the tree as JSON
    setGeneratedCode(JSON.stringify(componentTree, null, 2));
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>Figma to Code Tool</h1>
      </header>
      
      <main className="container">
        <div className="card">
          <h2>Connect to Figma</h2>
          <FigmaInput 
            figmaUrl={figmaUrl}
            figmaToken={figmaToken}
            onUrlChange={setFigmaUrl}
            onTokenChange={setFigmaToken}
            onFetch={handleFetchComponents}
            isLoading={isLoading}
            onSaveToken={handleSaveToken}
            onClearToken={handleClearToken}
          />
          
          {error && (
            <div className="error-message">
              Error: {error}
            </div>
          )}
        </div>
        
        {componentTree && (
          <>
            <div className="card">
              <h2>Component Tree Visualization</h2>
              <div className="tree-viewer-container">
                <TreeViewer node={componentTree} />
              </div>
              <div className="actions" style={{ marginTop: '1rem' }}>
                <button onClick={handleGenerateCode}>
                  Generate Code
                </button>
              </div>
            </div>
            
            {generatedCode && (
              <div className="card">
                <h2>Generated Code</h2>
                <CodeOutput code={generatedCode} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App; 