import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { PublicRoute } from "../../src/components/public-route";
import LandingPage from "./pages/landing-page";
import { ProtectedRoute } from "../../src/components/protected-route";
import DashboardPage from "./pages/dashboard/dashboard";

import CustomerApp from "./pages/user/user-landing-page";
import VendorMenuPage from "./pages/vendor/vendor-details";
import SearchPage from "./pages/search/SearchVendor";
import CheckoutPage from "./pages/checkout/checkout";
import PaymentSuccess from "./pages/payment/payment-success-khalti";
import UserOrders from "./pages/order/user-orders";
import PaymentFailure from "./pages/payment/payment-failure-khalti";
import { AuthLayout } from "./layouts/auth-layout";



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
      path="/khajaride/checkout/:cartVendorId"
      element={
        <ProtectedRoute>
          <CheckoutPage />
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


    <Route
      path="/payment/status"
      element={
        <ProtectedRoute>
          <PaymentSuccess />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payment/payment-failed"
      element={
        <ProtectedRoute>
          <PaymentFailure />
        </ProtectedRoute>
      }
    />
     <Route
      path="/orders"
      element={
        <ProtectedRoute>
          <UserOrders />
        </ProtectedRoute>
      }
    />
    
    </>
)
const router = createBrowserRouter(routes);

export default router;