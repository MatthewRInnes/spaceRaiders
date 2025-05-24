// Import React and application components
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create and render the root React component
// The '!' operator asserts that the element exists
createRoot(document.getElementById("root")!).render(<App />);
