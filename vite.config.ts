// Import necessary dependencies for Vite configuration
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Vite configuration documentation: https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Server configuration for development environment
  server: {
    host: "::", // Listen on all network interfaces
    port: 8080, // Development server port
  },
  // Plugin configuration
  plugins: [
    react(), // React plugin for SWC compiler
  ],
  // Module resolution configuration
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Alias for source directory
    },
  },
}));
