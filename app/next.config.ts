import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const pagesBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (repoName ? `/${repoName}` : "");

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages is served from a subpath: https://<user>.github.io/<repo>/
  ...(isGitHubPages && pagesBasePath
    ? { basePath: pagesBasePath, assetPrefix: pagesBasePath }
    : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
