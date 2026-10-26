import type { NextConfig } from "next";

const configuracionNext: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // En desarrollo, Next imprime los argumentos de cada Server Function. Un argumento con datos
  // de la persona quedaría en el log (#55).
  logging: { serverFunctions: false },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default configuracionNext;
