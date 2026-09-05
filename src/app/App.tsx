import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LoginPage } from "./components/LoginPage";
import { Register } from "./components/Register";
import { MarketplaceFeed } from "./components/MarketplaceFeed";
import { ProductDetails } from "./components/ProductDetails";
import { CreateListing } from "./components/CreateListing";
import { ChatMeetup } from "./components/ChatMeetup";
import { Profile } from "./components/Profile";
import { ClubMerchPage } from "./components/ClubMerchPage";
import { ClubMerchAdminCreate } from "./components/ClubMerchAdminCreate";
import { LostAndFoundPage } from "./components/LostAndFoundPage";
import { ReportLostFound } from "./components/ReportLostFound";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { EditProduct } from "./components/EditProduct";
import { AdminDashboard } from "./components/AdminDashboard";
import { CartPage } from "./components/CartPage";
import { CartProvider } from "./context/CartContext";
import { SystemAnnouncements } from "./components/SystemAnnouncements";
import { SellerProfile } from "./components/SellerProfile";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
import { supabase } from "../supabase";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // 1. Check if they are already logged in when the app loads (prevents logout on refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setLoadingAuth(false);
    });

    // 2. Listen for login/logout events automatically (This replaces handleLogin!)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show a blank screen or a loading spinner while Supabase checks the session
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  // If not logged in, ONLY allow access to Register and Login
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* If they try to go anywhere else (like /marketplace), redirect to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If logged in, show the main application
  return (
    <CartProvider>
    <div className="min-h-screen flex bg-gray-50">
      {/* 1. Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* 2. Main Content Area (Shifts right when Sidebar is open) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        
        {/* 3. The Global Navbar */}
        <Navbar />
        <SystemAnnouncements />
        
        {/* 4. Page Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/marketplace" replace />} />
            <Route path="/marketplace" element={<MarketplaceFeed />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/seller/:sellerId" element={<SellerProfile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/edit/:productId" element={<EditProduct />} />
            <Route path="/create" element={<CreateListing />} />
            <Route path="/chat/:sellerId" element={<ChatMeetup />} />
            <Route path="/clubmerch/admin" element={<Navigate to="/admin" replace />} />
            <Route path="/clubmerchcreate" element={<ClubMerchAdminCreate />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/clubmerch" element={<ClubMerchPage />} />
            <Route path="/lostfound" element={<LostAndFoundPage />} />
            <Route path="/reportlostfound" element={<ReportLostFound />} />
            <Route path="*" element={<Navigate to="/marketplace" replace />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

      </div>
    </div>
    </CartProvider>
  );
}