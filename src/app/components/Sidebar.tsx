import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabase";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || "marketplace";

  const menuItems = [
    { label: "Second Hand Products", page: "marketplace", icon: "🛍️" },
    { label: "Club Merchandise", page: "clubmerch", icon: "👕" },
    { label: "Lost & Found Item", page: "lostfound", icon: "🔍" },
    { label: "Settings", page: "profile", icon: "⚙️" },
  ];

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-[60] h-12 w-12 rounded-full border border-gray-200 bg-white shadow-lg text-gray-700 hover:bg-gray-100"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r shadow-sm transition-transform duration-300 ease-in-out z-40 w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 pt-16">
          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => (
              <Button
                key={item.page}
                onClick={() => {
                  navigate(`/${item.page}`);
                  onToggle(); // Close sidebar after navigation
                }}
                variant={currentPage === item.page ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left",
                  currentPage === item.page
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "hover:bg-gray-100"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Button>
            ))}
          </nav>
          
          <div className="mt-8 border-t pt-4">
            <Button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/login');
                onToggle();
              }}
              variant="ghost"
              className="w-full justify-start text-left text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <span className="mr-3">🚪</span>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}