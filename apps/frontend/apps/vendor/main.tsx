import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css"
import { RouterProvider } from "react-router-dom";
import venodrRouter from "./vendor-router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
     <RouterProvider router={venodrRouter} />
  </React.StrictMode>
);
