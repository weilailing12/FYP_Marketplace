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
import { supabase } from "../supabase";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // 1. Check current session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // We can keep this for the LoginPage prop, but it's redundant now because 
    // onAuthStateChange will automatically catch the login and update state.
    setIsLoggedIn(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* 1. Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* 2. Main Content Area (Shifts right when Sidebar is open) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        
        {/* 3. The Global Navbar is back! */}
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
          </Routes>
        </main>

      </div>
    </div>
  );
}