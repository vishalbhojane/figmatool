interface FigmaNode {
  id: string;
  name: string;
  type: string;
  description?: string;
  children?: FigmaNode[];
  properties?: Record<string, any>;
}
interface FigmaUrlInfo {
  fileId: string;
  nodeId?: string;
}

export const getFigmaFileIdFromUrl = (url: string): string => {
  const urlInfo = parseFigmaUrl(url);
  return urlInfo.fileId;
};

export const parseFigmaUrl = (url: string): FigmaUrlInfo => {
  // Handle different Figma URL formats:
  // - https://www.figma.com/file/abcdef123456/FileName
  // - https://www.figma.com/design/abcdef123456/FileName
  // - URLs with query parameters like node-id=381-150

  let fileId = "";

  // First try the /file/ format
  let match = url.match(/figma\.com\/file\/([^/?]+)/);

  // If not found, try the /design/ format
  if (!match) {
    match = url.match(/figma\.com\/design\/([^/?]+)/);
  }

  if (match) {
    fileId = match[1];
  }

  // Try to extract node ID if present
  let nodeId: string | undefined;
  const nodeMatch = url.match(/node-id=([^&]+)/);
  if (nodeMatch) {
    nodeId = nodeMatch[1];
  }

  return { fileId, nodeId };
};

export const fetchFigmaFile = async (
  fileId: string,
  token: string,
  nodeId?: string
): Promise<any> => {
  try {
    // Base URL for the file
    let url = `https://api.figma.com/v1/files/${fileId}`;

    // If nodeId is specified, add it to the request
    if (nodeId) {
      url += `/nodes?ids=${nodeId}`;
    }

    console.log(`Fetching Figma data from: ${url}`);

    const response = await fetch(url, {
      headers: {
        "X-Figma-Token": token,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Figma file: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Figma file:", error);
    throw error;
  }
};

export const extractComponentTree = (figmaData: any): FigmaNode | null => {
  // Function to extract properties from a Figma node
  const extractSerializableNodeData = (node: any): Record<string, any> => {
    const data: Record<string, any> = {};

    for (const key in node) {
      const value = (node as any)[key];

      // Exclude functions, undefined, and symbols
      if (
        typeof value !== "function" &&
        value !== undefined &&
        typeof key !== "symbol"
      ) {
        try {
          // Only JSON-serializable values
          JSON.stringify(value); // test if it's serializable
          data[key] = value;
        } catch {
          data[key] = "[Non-serializable]";
        }
      }
    }

    return data;
  };

  // Recursive function to build the tree
  const buildTree = (node: any): FigmaNode | null => {
    if (!node) return null;

    // Skip this node and its children if it's hidden
    if (node?.visible === false) return null;

    const result: FigmaNode = {
      id: node.id || "unknown",
      name: node.name || "Unnamed",
      type: node.type || "UNKNOWN",
      description: node.description,
      properties: extractSerializableNodeData(node),
      children: [],
    };

    // Process children nodes
    if (node.children && Array.isArray(node.children)) {
      result.children = node.children
        .map((child: any) => buildTree(child))
        .filter(
          (child: FigmaNode | null): child is FigmaNode => child !== null
        );
    }

    return result;
  };

  // Handle the different structure the API might return

  // If we have a document (full file)
  if (figmaData.document) {
    return buildTree(figmaData.document);
  }

  // If we have nodes (specific node request)
  if (figmaData.nodes) {
    // Return the first node we find
    for (const nodeId in figmaData.nodes) {
      const nodeData = figmaData.nodes[nodeId];
      if (nodeData.document) {
        return buildTree(nodeData.document);
      }
    }
  }

  // No valid nodes found
  return null;
};

export default {
  fetchFigmaFile,
  extractComponentTree,
  getFigmaFileIdFromUrl,
  parseFigmaUrl,
};
