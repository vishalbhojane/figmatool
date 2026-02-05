import React, { useState } from "react";

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
  onClearToken,
}) => {
  const [showToken, setShowToken] = useState(false);

  // Check if a node ID is present to warn the user
  const hasNodeId = figmaUrl.includes("node-id=");

  return (
    <div className="figma-input">
      <div className="input-group">
        <label htmlFor="figma-url">Figma File or Design URL</label>
        <input
          id="figma-url"
          type="text"
          value={figmaUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://www.figma.com/design/..."
          disabled={isLoading}
          className={!hasNodeId && figmaUrl ? "warning-border" : ""}
        />
        <small style={{ color: hasNodeId ? "inherit" : "#e67e22", margin: 0 }}>
          {hasNodeId
            ? "Targeting specific node for compression."
            : "Tip: Select a specific frame in Figma and copy that link for better results."}
        </small>
      </div>

      <div className="input-group">
        <label htmlFor="figma-token">Figma API Token</label>
        <div
          className="token-input-wrapper"
          style={{ display: "flex", gap: "8px" }}
        >
          <input
            id="figma-token"
            type={showToken ? "text" : "password"}
            value={figmaToken}
            onChange={(e) => onTokenChange(e.target.value)}
            placeholder="figd_..."
            disabled={isLoading}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="secondary-btn"
          >
            {showToken ? "Hide" : "Show"}
          </button>
        </div>

        {(onSaveToken || onClearToken) && (
          <div
            className="token-actions"
            style={{ marginTop: "8px", display: "flex", gap: "10px" }}
          >
            {onSaveToken && (
              <button
                onClick={onSaveToken}
                disabled={!figmaToken.trim() || isLoading}
                className="save-token-btn"
                type="button"
              >
                Save Token Locally
              </button>
            )}
            {onClearToken && (
              <button
                onClick={onClearToken}
                disabled={isLoading}
                className="clear-token-btn"
                type="button"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <button
        className="btn-primary main-fetch-btn"
        onClick={onFetch}
        disabled={!figmaUrl || !figmaToken || isLoading}
        style={{ width: "100%", marginTop: "1rem" }}
      >
        {isLoading ? "Processing Pipeline..." : "Fetch & Compress for LLM"}
      </button>
    </div>
  );
};

export default FigmaInput;
