import { createBrowserRouter, Navigate } from "react-router-dom";
import AllCollections from "./pages/AllCollections";
import Landingpage from "./pages/Landingpage";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Wishlist from "./pages/Wishlist";
import ProductView from "./pages/ProductView";
import Bag from "./pages/Bag";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Checkout from "./pages/Checkout";
import CheckoutPayment from "./pages/CheckoutPayment";
import CheckoutReview from "./pages/CheckoutReview";
import CheckoutSuccess from "./pages/CheckoutSuccess";

const router = createBrowserRouter([
    {path:"/all-collections",element: <AllCollections />},
    {path:"/home",element: <Landingpage />},
    {path:"/register",element:<Register />},
    {path:"/login",element:<Login />},
    {path:"/wishlist",element:<Wishlist />},
    { path: "/product/:id", element: <ProductView/> },
    {path:"/bag",element:<Bag />},
    { path: "/checkout", element: <Checkout/> },
    {path:"/customer-dashboard",element:<CustomerDashboard />},
    {path:"/admin-dashboard",element:<AdminDashboard />}, 
    {path:"/",element: <Navigate to="/home" replace />},
    { path: "/checkout/payment", element: <CheckoutPayment /> },
    { path: "/checkout/review", element: <CheckoutReview /> },
    { path: "/checkout/success", element: <CheckoutSuccess /> },
]);

export default router;