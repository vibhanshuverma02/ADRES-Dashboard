const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const getAssetPath = (src: string | undefined) => {
  if (!src) return "";
  if (src.startsWith(BASE_PATH)) return src;
  return `${BASE_PATH}${src}`;
};

// helper/roleMap.ts
export const roleUrlMap: Record<string, string> = {
  SUPER_ADMIN: "superadmin",
  COE_MANAGER: "coemanager",
  RESEARCHER: "researcher",
};
