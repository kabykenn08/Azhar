import { useContentStore } from "./contentStore";

export function useText(key: string): string {
  const content = useContentStore((s) => s.content);
  return content[key] || key;
}