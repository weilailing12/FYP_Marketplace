import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Sidebar({ onNavigate, currentPage }: SidebarProps) {
  const menuItems = [
    { label: "Second Hand Products", page: "marketplace", icon: "🛍️" },
    { label: "Club Merchandise", page: "clubmerch", icon: "👕" },
    { label: "Services", page: "chat", icon: "💼" },
    { label: "Lost & Found Item", page: "lostfound", icon: "🔍" },
  ];

  return (
    <div className="w-64 bg-white border-r shadow-sm h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-8">CampusTrade</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.page}
              onClick={() => onNavigate(item.page)}
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
  );
}