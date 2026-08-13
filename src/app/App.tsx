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
import { ClubMerchAdminDashboard } from "./components/ClubMerchAdminDashboard";
import { LostAndFoundPage } from "./components/LostAndFoundPage";
import { ReportLostFound } from "./components/ReportLostFound";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { EditProduct } from "./components/EditProduct";
import { AdminDashboard } from "./components/AdminDashboard";
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
        <Route path="/register" element={<Register />} />
        {/* We pass an empty function because Supabase's listener above handles the login automatically */}
        <Route path="*" element={<LoginPage onLogin={() => {}} />} />
      </Routes>
    );
  }

  // If logged in, show the main application
  return (
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
        
        {/* 4. Page Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/marketplace" replace />} />
            <Route path="/marketplace" element={<MarketplaceFeed />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/edit/:productId" element={<EditProduct />} />
            <Route path="/create" element={<CreateListing />} />
            <Route path="/chat/:sellerId" element={<ChatMeetup />} />
            <Route path="/clubmerch/admin" element={<ClubMerchAdminDashboard />} />
            <Route path="/clubmerchcreate" element={<ClubMerchAdminCreate />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/clubmerch" element={<ClubMerchPage />} />
            <Route path="/lostfound" element={<LostAndFoundPage />} />
            <Route path="/reportlostfound" element={<ReportLostFound />} />
            <Route path="*" element={<Navigate to="/marketplace" replace />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

      </div>
    </div>
  );
}