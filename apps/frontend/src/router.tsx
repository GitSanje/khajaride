import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { PublicRoute } from "./components/public-route";
import LandingPage from "./pages/landing-page";
import { ProtectedRoute } from "./components/protected-route";
import DashboardPage from "./pages/dashboard/dashboard";



const routes = createRoutesFromElements(
    <>
    <Route
      path="/"
      element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      }
    />

     <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
    
    </>
)
const router = createBrowserRouter(routes);

export default router;