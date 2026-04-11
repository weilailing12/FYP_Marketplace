import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, Search, PlusCircle, Megaphone, User, AlertTriangle, Party, BookOpen, Info } from "lucide-react";

interface BulletinPost {
  id: string;
  title: string;
  content: string;
  category: "announcement" | "event" | "general" | "academic";
  author: string;
  importance: "high" | "normal" | "low";
  image?: string;
  created_at: string;
}

interface BulletinBoardProps {
  onNavigate: (page: string) => void;
}

export function BulletinBoard({ onNavigate }: BulletinBoardProps) {
  const [posts, setPosts] = useState<BulletinPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/bulletin/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'event': return <Party className="h-4 w-4" />;
      case 'academic': return <BookOpen className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Megaphone className="text-blue-600" />
              Community Bulletin Board
            </h1>
            <p className="text-gray-600">Stay updated with campus announcements and events.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 h-11" onClick={() => onNavigate('create-bulletin')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="announcement">Announcements</TabsTrigger>
              <TabsTrigger value="event">Events</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {posts.map((post) => (
                <BulletinCard key={post.id} post={post} />
              ))}
            </TabsContent>

            {['announcement', 'event', 'academic', 'general'].map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                {posts.filter(p => p.category === category).map((post) => (
                  <BulletinCard key={post.id} post={post} />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}

function BulletinCard({ post }: { post: BulletinPost }) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'event': return <Party className="h-4 w-4" />;
      case 'academic': return <BookOpen className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getCategoryIcon(post.category)}
            <Badge variant="outline" className="capitalize">
              {post.category}
            </Badge>
            <Badge className={getImportanceColor(post.importance)}>
              {post.importance}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <User className="h-3 w-3" />
            {post.author}
          </div>
        </div>

        <h3 className="font-bold text-xl mb-2">{post.title}</h3>
        <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>

        {post.image && (
          <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded mb-3" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="h-3 w-3" />
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}