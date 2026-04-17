import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { Register } from "./components/Register";
import { MarketplaceFeed } from "./components/MarketplaceFeed";
import { ProductDetails } from "./components/ProductDetails";
import { CreateListing } from "./components/CreateListing";
import { ChatMeetup } from "./components/ChatMeetup";
import { Dashboard } from "./components/Dashboard";
import { Profile } from "./components/Profile";
import { ClubMerchPage } from "./components/ClubMerchPage";
import { LostAndFoundPage } from "./components/LostAndFoundPage";
import { ReportLostFound } from "./components/ReportLostFound";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";

type Page = "login" | "register" | "marketplace" | "product" | "create" | "chat" | "dashboard" | "profile" | "clubmerch" | "lostfound" | "reportlostfound";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (page: string, productId?: string) => {
    setCurrentPage(page as Page);
    if (productId) {
      setSelectedProductId(productId);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage("marketplace");
  };

  if (!isLoggedIn && currentPage === "login") {
    return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate}/>;
  }

  if (!isLoggedIn && currentPage === "register") {
    return <Register onNavigate={handleNavigate} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case "marketplace": return <MarketplaceFeed onNavigate={handleNavigate} />;
      case "product": return <ProductDetails onNavigate={handleNavigate} productId={selectedProductId} />;
      case "create": return <CreateListing onNavigate={handleNavigate} />;
      case "chat": return <ChatMeetup onNavigate={handleNavigate} />;
      case "dashboard": return <Dashboard onNavigate={handleNavigate} />;
      case "profile": return <Profile onNavigate={handleNavigate} />;
      case "clubmerch": return <ClubMerchPage onNavigate={handleNavigate} />;
      case "lostfound": return <LostAndFoundPage onNavigate={handleNavigate} />;
      case "reportlostfound": return <ReportLostFound onNavigate={handleNavigate} />;
      default: return <MarketplaceFeed onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* 1. Sidebar */}
      <Sidebar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* 2. Main Content Area (Shifts right when Sidebar is open) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        
        {/* 3. The Global Navbar is back! */}
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
        
        {/* 4. Page Content */}
        <main className="flex-1">
          {renderContent()}
        </main>

      </div>
    </div>
  );
}