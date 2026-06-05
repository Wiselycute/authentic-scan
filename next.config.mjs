import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const normalizeBackendOrigin = (value) => {
  if (!value) {
    return null;
  }

  let candidate = String(value).trim();
  if (!candidate) {
    return null;
  }

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    url.pathname = "";
    return url.origin;
  } catch {
    return null;
  }
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.1.53"],
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    const backendOrigin =
      normalizeBackendOrigin(process.env.BACKEND_ORIGIN) ||
      normalizeBackendOrigin(process.env.NEXT_PUBLIC_DIRECT_API_BASE_URL) ||
      "http://localhost:4000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
