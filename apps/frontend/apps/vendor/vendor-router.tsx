import { Route, createRoutesFromElements, createBrowserRouter } from "react-router-dom";
import VendorDashboard from "../vendor/pages/vendor-dashboard";
import { PublicRoute } from "@/components/public-route";
import { AuthLayout } from "@/components/layouts/auth-layout";
import VendorSignupPage from "./pages/sign-up";
import { ProtectedRoute } from "@/components/protected-route";
import VendorOnboardingPage from "./pages/vendor-onboarding";

const routes = createRoutesFromElements(
  <>


    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <VendorDashboard />
        </ProtectedRoute>


      }
    />
    <Route
      path="/"
      element={
        <PublicRoute>
          <VendorSignupPage />
        </PublicRoute>
      }
    />
    <Route
      path="/vendor-onboarding"
      element={
        <ProtectedRoute>
          <VendorOnboardingPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/*"
      element={
        <PublicRoute>
          <AuthLayout />
        </PublicRoute>
      }
    />


  </>
)

const venodrRouter = createBrowserRouter(routes);

export default venodrRouter;