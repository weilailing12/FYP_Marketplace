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
import { WishlistPage } from "./components/WishList";
import { Sidebar } from "./components/Sidebar";

type Page = "login" | "register" | "marketplace" | "product" | "create" | "chat" | "dashboard" | "profile" | "clubmerch" | "lostfound" | "wishlist";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  // 4. Added "register" to the logic
  if (!isLoggedIn && currentPage === "register") {
    return <Register onNavigate={handleNavigate} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case "marketplace":
        return <MarketplaceFeed onNavigate={handleNavigate} />;
      case "product":
        return <ProductDetails onNavigate={handleNavigate} productId={selectedProductId} />;
      case "create":
        return <CreateListing onNavigate={handleNavigate} />;
      case "chat":
        return <ChatMeetup onNavigate={handleNavigate} />;
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "profile":
        return <Profile onNavigate={handleNavigate} />;
      case "clubmerch":
        return <ClubMerchPage onNavigate={handleNavigate} />;
      case "lostfound":
        return <LostAndFoundPage onNavigate={handleNavigate} />;
      case "wishlist":
        return <WishlistPage onNavigate={handleNavigate} />;
      default:
        return <MarketplaceFeed onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex">
      <Sidebar onNavigate={handleNavigate} currentPage={currentPage} />
      <div className="ml-64 flex-1">
        {renderContent()}
      </div>
    </div>
  );
}
