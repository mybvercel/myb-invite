import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },

  /* Las viejas páginas por tipo de evento se unificaron en la página única,
     donde el visitante elige el evento. Se redirigen para no romper enlaces
     ya compartidos. */
  async redirects() {
    return [
      { source: "/bodas", destination: "/", permanent: true },
      { source: "/cumples", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
