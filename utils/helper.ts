export function decodeAdditionalInfo(hexString: string): string {
  if (!hexString || hexString === "0x") return "";
  
  try {
    const hex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
    
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
    const decoded = new TextDecoder().decode(bytes);
    
    return decoded;
  } catch (error) {
    console.error("Failed to decode additional info:", error);
    return "";
  }
}

export function convertIpfsUrl(url: string): string {
  if (!url) return "";
  return url.startsWith("ipfs://")
    ? url.replace("ipfs://", "https://ipfs.io/ipfs/")
    : url;
}