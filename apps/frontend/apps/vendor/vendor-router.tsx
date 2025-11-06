import { Route, createRoutesFromElements, createBrowserRouter, Navigate } from "react-router-dom";
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
      path="/sign-up"
      element={
        <PublicRoute>
          <VendorSignupPage />
        </PublicRoute>
      }
    />
 <Route
      path="/vendor-onboarding/*"
      element={
        <ProtectedRoute>
          <VendorOnboardingPage />
        </ProtectedRoute>
      }
    >
      {/* Nested routes for each step */}
      <Route path="profile" />
      <Route path="address" />
      <Route path="payout" />
      <Route path="review" />
      {/* Default redirect to first step */}
      <Route index element={<Navigate to="profile" replace />} />
    </Route>
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