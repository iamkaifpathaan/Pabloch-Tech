/** Build-time environment, set by scripts/build.ts before each page is rendered. */
export interface BuildEnv {
  dev: boolean;
  year: number;
  buildDate: string;
  css: string;
  js: string;
  headScriptHash: string;
  /**
   * Prefix for local files: "" on the home page, "../" one level down,
   * "../../" two levels down (relative, so pages also work from a local
   * preview or a sub-folder), and "/" on the 404 page, which can be served
   * at any path.
   */
  base: string;
  /** Path of the page being rendered, relative to the site root ("" = home, "work/" …). */
  page: string;
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
  page: "",
  configVersion: "0",
};

export function setEnv(next: Partial<BuildEnv>): void {
  Object.assign(env, next);
}
