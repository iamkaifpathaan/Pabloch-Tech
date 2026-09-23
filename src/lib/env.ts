/** Build-time environment, set once by scripts/build.ts before rendering. */
export interface BuildEnv {
  dev: boolean;
  year: number;
  buildDate: string;
  css: string;
  js: string;
  headScriptHash: string;
  /** Prefix for local files: "" (relative) on the home page so it also opens from disk, "/" on the 404 page, which can be served at any path. */
  base: string;
}

export const env: BuildEnv = {
  dev: false,
  year: new Date().getFullYear(),
  buildDate: new Date().toISOString().slice(0, 10),
  css: "",
  js: "",
  headScriptHash: "",
  base: "/",
};

export function setEnv(next: Partial<BuildEnv>): void {
  Object.assign(env, next);
}
