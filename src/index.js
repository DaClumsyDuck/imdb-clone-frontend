import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

// Create a root using React 18's createRoot method
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement); // Use createRoot to create a root

// Render the app inside the root
root.render(
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>,
);

// Optionally, you can enable StrictMode (it helps with highlighting potential problems in your app)
// root.render(
//   <React.StrictMode>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </React.StrictMode>
// );

// Uncomment this line if you want to measure performance in my app
// reportWebVitals();
