import React from 'react';

interface FigmaInputProps {
  figmaUrl: string;
  figmaToken: string;
  onUrlChange: (url: string) => void;
  onTokenChange: (token: string) => void;
  onFetch: () => void;
  isLoading?: boolean;
  onSaveToken?: () => void;
  onClearToken?: () => void;
}

const FigmaInput: React.FC<FigmaInputProps> = ({
  figmaUrl,
  figmaToken,
  onUrlChange,
  onTokenChange,
  onFetch,
  isLoading = false,
  onSaveToken,
  onClearToken
}) => {
  return (
    <div className="figma-input">
      <div className="input-group">
        <label htmlFor="figma-url">Figma File URL</label>
        <input
          id="figma-url"
          type="text"
          value={figmaUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://www.figma.com/file/..."
          disabled={isLoading}
        />
        <small>
          Include the <code>node-id</code> parameter to target a specific component or frame.
          <br />
          Example: <code>https://www.figma.com/file/abc123/Design?node-id=123-456</code>
        </small>
      </div>
      
      <div className="input-group">
        <label htmlFor="figma-token">Figma API Token</label>
        <input
          id="figma-token"
          type="password"
          value={figmaToken}
          onChange={(e) => onTokenChange(e.target.value)}
          placeholder="Paste your Figma API token here"
          disabled={isLoading}
        />
        <small>
          You can generate a personal access token in your 
          <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noopener noreferrer">
            {' '}Figma account settings
          </a>
        </small>
        
        {(onSaveToken || onClearToken) && (
          <div className="token-actions">
            {onSaveToken && (
              <button 
                onClick={onSaveToken}
                disabled={!figmaToken.trim() || isLoading}
                className="save-token-btn"
                type="button"
              >
                Save Token
              </button>
            )}
            {onClearToken && (
              <button 
                onClick={onClearToken}
                disabled={isLoading}
                className="clear-token-btn"
                type="button"
              >
                Clear Token
              </button>
            )}
          </div>
        )}
      </div>
      
      <button 
        onClick={onFetch}
        disabled={!figmaUrl || !figmaToken || isLoading}
      >
        {isLoading ? 'Fetching...' : 'Fetch Components'}
      </button>
    </div>
  );
};

export default FigmaInput; 