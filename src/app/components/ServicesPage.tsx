import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Star, MapPin, Calendar, MessageCircle, DollarSign } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  provider: string;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
}

const mockServices: Service[] = [
  {
    id: "1",
    title: "Event Sponsorship Package",
    description: "Complete sponsorship package for university events including banners, social media promotion, and event coverage.",
    category: "Sponsorship",
    price: 500,
    provider: "Campus Marketing Club",
    rating: 4.8,
    reviews: 24,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400",
    tags: ["Events", "Marketing", "Promotion"]
  },
  {
    id: "2",
    title: "Professional Poster Design",
    description: "Custom poster design for events, clubs, and academic purposes. Includes 3 revisions and high-resolution files.",
    category: "Design",
    price: 80,
    provider: "Design & Creative Club",
    rating: 4.9,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=400",
    tags: ["Graphics", "Events", "Academic"]
  },
  {
    id: "3",
    title: "Event Photography Service",
    description: "Professional photography coverage for university events, ceremonies, and club activities.",
    category: "Photography",
    price: 200,
    provider: "Photography Club",
    rating: 4.7,
    reviews: 31,
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?q=80&w=400",
    tags: ["Events", "Professional", "Coverage"]
  },
  {
    id: "4",
    title: "Music Production & Mixing",
    description: "Professional music production, mixing, and mastering services for university bands and events.",
    category: "Music",
    price: 150,
    provider: "Music Club",
    rating: 4.6,
    reviews: 18,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400",
    tags: ["Audio", "Production", "Events"]
  },
  {
    id: "5",
    title: "Academic Tutoring Service",
    description: "One-on-one tutoring for various subjects including mathematics, physics, chemistry, and programming.",
    category: "Education",
    price: 30,
    provider: "Academic Excellence Center",
    rating: 4.9,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400",
    tags: ["Tutoring", "Academic", "Subjects"]
  },
  {
    id: "6",
    title: "Club Merchandise Design",
    description: "Custom design services for club merchandise including t-shirts, hoodies, and promotional materials.",
    category: "Design",
    price: 120,
    provider: "Fashion & Design Club",
    rating: 4.5,
    reviews: 22,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400",
    tags: ["Merchandise", "Custom", "Design"]
  }
];

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Sponsorship", "Design", "Photography", "Music", "Education"];

  const filteredServices = selectedCategory === "All"
    ? mockServices
    : mockServices.filter(service => service.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">University Services</h1>
          <p className="text-gray-600">Professional services offered by university clubs and organizations</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-blue-600">
                  {service.category}
                </Badge>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {service.provider.split(' ').map(word => word[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">{service.provider}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{service.rating}</span>
                    <span className="text-sm text-gray-500">({service.reviews})</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">RM {service.price}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {service.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => onNavigate('chat')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Provider
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}