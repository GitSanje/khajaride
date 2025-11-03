import { Route, createRoutesFromElements, createBrowserRouter } from "react-router-dom";
import VendorDashboard from "../vendor/pages/vendor-dashboard";

const routes = createRoutesFromElements(
    <>


        <Route
            path="/dashboard"
            element={

                <VendorDashboard />

            }
        />

    </>
)

const venodrRouter = createBrowserRouter(routes);

export default venodrRouter;