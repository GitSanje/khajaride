import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { PublicRoute } from "./components/public-route";
import LandingPage from "./pages/landing-page";
import { ProtectedRoute } from "./components/protected-route";
import DashboardPage from "./pages/dashboard/dashboard";
import { AuthLayout } from "./components/layouts/auth-layout";
import CustomerApp from "./pages/user/user-landing-page";
import VendorMenuPage from "./pages/user/vendor-details";
import SearchPage from "./pages/search/SearchVendor";



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
      path="/auth/*"
      element={
        <PublicRoute>
          <AuthLayout />
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

     <Route
      path="/khajaride*"
      element={
        <ProtectedRoute>
          <CustomerApp />
        </ProtectedRoute>
      }
    />

    <Route
      path="/khajaride/vendor/:vendorId"
      element={
        <ProtectedRoute>
          <VendorMenuPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/khajaride/search"
      element={
        <ProtectedRoute>
          <SearchPage />
        </ProtectedRoute>
      }
    />
    
    </>
)
const router = createBrowserRouter(routes);

export default router;