import React, { useState, useEffect, useMemo } from 'react';
import FigmaInput from './components/FigmaInput';
import CodeOutput from './components/CodeOutput';
import figmaService from './services/figmaService';
import TreeViewer from './components/TreeViewer';
import './App.css';
import { FigmaCompressor } from './services/FigmaCompressor';


const FIGMA_TOKEN_KEY = 'figma_api_token';

const App: React.FC = () => {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [figmaToken, setFigmaToken] = useState('');
  const [compressedData, setCompressedData] = useState<any | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize compressor with the current token
  const compressor = useMemo(() => new FigmaCompressor(figmaToken), [figmaToken]);

  useEffect(() => {
    const savedToken = localStorage.getItem(FIGMA_TOKEN_KEY);
    if (savedToken) setFigmaToken(savedToken);
  }, []);

  const handleFetchAndCompress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setGeneratedCode('');
      setCompressedData(null);

      const { fileId, nodeId } = figmaService.parseFigmaUrl(figmaUrl);
      if (!fileId) throw new Error('Invalid Figma URL.');

      // The new streamlined pipeline
      const result = await compressor.getCompressedData(fileId, nodeId);
      
      if (result) {
        setCompressedData(result);
        // Automatically show the "code" as the compressed JSON for now
        setGeneratedCode(JSON.stringify(result, null));
      } else {
        setError('No visible nodes found.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally { 
      setIsLoading(false);
    }
  };


  return (
    <div className="app">
      <header className="app-header">
        <h1>Figma to Code</h1>
      </header>
      
      <main className="container">
        <div className="card">
          <FigmaInput 
            figmaUrl={figmaUrl}
            figmaToken={figmaToken}
            onUrlChange={setFigmaUrl}
            onTokenChange={setFigmaToken}
            onFetch={handleFetchAndCompress}
            isLoading={isLoading}
            onSaveToken={() => localStorage.setItem(FIGMA_TOKEN_KEY, figmaToken)}
            onClearToken={() => { localStorage.removeItem(FIGMA_TOKEN_KEY); setFigmaToken(''); }}
          />
          {error && <div className="error-message">{error}</div>}
        </div>
        
        {compressedData && (
          <>
            <div className="card">
              <div className="card-header">
                <h2>UI Structural Map</h2>
              </div>
              <div className="tree-viewer-container">
                <TreeViewer node={compressedData} />
              </div>
            </div>
            
            {generatedCode && (
              <div className="card">
                <h2>Output</h2>
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