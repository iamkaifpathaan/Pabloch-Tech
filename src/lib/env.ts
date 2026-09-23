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
  /**
   * Fingerprint of config.js, appended as ?v= so browsers can never keep
   * using an old copy (e.g. old social handles) after it changes.
   */
  configVersion: string;
}

export const env: BuildEnv = {
  dev: false,
  year: new Date().getFullYear(),
  buildDate: new Date().toISOString().slice(0, 10),
  css: "",
  js: "",
  headScriptHash: "",
  base: "/",
  configVersion: "0",
};

export function setEnv(next: Partial<BuildEnv>): void {
  Object.assign(env, next);
}
