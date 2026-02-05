// types.ts
const KEY_MAP: Record<string, string> = {
  type: "t",
  name: "n",
  children: "c",
  characters: "v",
  layoutMode: "lm",
  itemSpacing: "is",
  paddingLeft: "pl",
  paddingTop: "pt",
  fills: "f",
  cornerRadius: "cr",
};

const VAL_MAP: Record<string, string> = {
  HORIZONTAL: "H",
  VERTICAL: "V",
  FRAME: "FR",
  TEXT: "TX",
  VECTOR: "IC",
};

export class FigmaCompressor {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private rgbToHex(c: any) {
    if (!c) return undefined;
    const toHex = (v: number) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
  }

  private curate(node: any): any | null {
    if (!node || node.visible === false) return null;

    // 1. Icon Detection & Simplification
    const isIcon =
      node.type === "VECTOR" || node.name.toLowerCase().includes("icon");
    if (isIcon) {
      return {
        [KEY_MAP.type]: "IC",
        [KEY_MAP.name]: node.name.replace(/icon\s?\/?\s?/gi, "").trim(),
      };
    }

    // 2. Wrapper Flattening (Remove empty containers)
    const hasNoStyles = !node.fills?.length && !node.cornerRadius;
    if (hasNoStyles && node.children?.length === 1) {
      return this.curate(node.children[0]);
    }

    // 3. Property Extraction & Mapping
    const result: Record<string, any> = {
      [KEY_MAP.type]: VAL_MAP[node.type] || node.type,
      [KEY_MAP.name]: node.name,
    };

    if (node.characters) result[KEY_MAP.characters] = node.characters;
    if (node.layoutMode) {
      result[KEY_MAP.layoutMode] = VAL_MAP[node.layoutMode] || node.layoutMode;
      result[KEY_MAP.itemSpacing] = node.itemSpacing;
    }

    // Add color only if it's a solid fill
    if (node.fills?.[0]?.type === "SOLID") {
      result[KEY_MAP.fills] = this.rgbToHex(node.fills[0].color);
    }

    // 4. Recursive Children Processing
    if (node.children) {
      const children = node.children
        .map((c: any) => this.curate(c))
        .filter(Boolean);
      if (children.length > 0) result[KEY_MAP.children] = children;
    }

    return result;
  }

  async getCompressedData(fileId: string, nodeId?: string) {
    const formattedNodeId = nodeId?.replace("-", ":");

    const url = nodeId
      ? `https://api.figma.com/v1/files/${fileId}/nodes?ids=${formattedNodeId}`
      : `https://api.figma.com/v1/files/${fileId}`;

    const res = await fetch(url, { headers: { "X-Figma-Token": this.token } });

    if (!res.ok) throw new Error(`Figma API error: ${res.statusText}`);

    const data = await res.json();

    let rootNode: any; // Use any here to handle the dynamic API structure

    if (nodeId && data.nodes) {
      // 1. Cast the specific node lookup
      const specificNode = data.nodes[formattedNodeId!] as any;

      // 2. Cast the Object.values result
      const firstNode = Object.values(data.nodes)[0] as any;

      rootNode = specificNode?.document || firstNode?.document;
    } else {
      rootNode = data.document;
    }

    if (!rootNode)
      throw new Error("Could not find document node in Figma response");

    return this.curate(rootNode);
  }
}
