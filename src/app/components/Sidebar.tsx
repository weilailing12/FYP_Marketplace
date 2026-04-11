import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import { Menu, X } from "lucide-react";

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ onNavigate, currentPage, isOpen, onToggle }: SidebarProps) {
  const menuItems = [
    { label: "Second Hand Products", page: "marketplace", icon: "🛍️" },
    { label: "Club Merchandise", page: "clubmerch", icon: "👕" },
    { label: "Services", page: "chat", icon: "💼" },
    { label: "Lost & Found Item", page: "lostfound", icon: "🔍" },
  ];

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 bg-white shadow-md hover:bg-gray-50"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r shadow-sm transition-transform duration-300 ease-in-out z-40 w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 pt-16">
          <h1 className="text-2xl font-bold text-blue-600 mb-8">CampusTrade</h1>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
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