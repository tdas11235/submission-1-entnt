// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'
import { seedIfNeeded } from "./db/dexie";
import { worker } from "./api/msw/browser";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 5, // Data is considered fresh for 5 seconds
        },
    },
});

const theme = createTheme({
  palette: {
  mode: "light", // change to 'dark' if preferred
  primary: {
    main: "#1976d2",
  },
  secondary: {
    main: "#9c27b0",
  },
  },
});

async function init() {
  await seedIfNeeded();
  await worker.start({ onUnhandledRequest: "bypass" });

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
         <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

init();
