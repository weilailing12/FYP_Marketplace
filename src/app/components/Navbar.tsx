import { Search, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface NavbarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <button
            onClick={() => onNavigate?.("marketplace")}
            className="text-2xl text-blue-600 cursor-pointer font-semibold hover:text-blue-700"
          >
            CampusTrade
          </button>

          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for items..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => onNavigate?.("create")}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Sell Item
            </Button>
            <Button
              onClick={() => onNavigate?.("dashboard")}
              variant="outline"
            >
              My Profile
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
