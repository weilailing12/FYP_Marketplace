import { useState } from "react";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Send, MapPin, Navigation } from "lucide-react";

interface Message {
  id: string;
  sender: "me" | "other";
  text: string;
  timestamp: string;
}

interface ChatMeetupProps {
  onNavigate: (page: string) => void;
}

export function ChatMeetup({ onNavigate }: ChatMeetupProps) {
  const [messages] = useState<Message[]>([
    {
      id: "1",
      sender: "other",
      text: "Hi! Is this MacBook still available?",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      sender: "me",
      text: "Yes, it's still available! Are you interested?",
      timestamp: "10:32 AM",
    },
    {
      id: "3",
      sender: "other",
      text: "Definitely! Can I see it in person? I'm on campus most days.",
      timestamp: "10:35 AM",
    },
    {
      id: "4",
      sender: "me",
      text: "Sure! How about we meet at the library tomorrow?",
      timestamp: "10:36 AM",
    },
    {
      id: "5",
      sender: "other",
      text: "Perfect! What time works for you?",
      timestamp: "10:38 AM",
    },
  ]);

  const [proposeMeetup, setProposeMeetup] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => onNavigate('product')}
          className="mb-4"
        >
          ← Back to Product
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)]">
          {/* Left Side - Chat */}
          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-600 text-white">SC</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Sarah Chen</CardTitle>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.sender === "me"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "me" ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {!proposeMeetup && (
                <div className="flex justify-center py-4">
                  <Button
                    onClick={() => setProposeMeetup(true)}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Propose Meetup
                  </Button>
                </div>
              )}
            </CardContent>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Right Side - Map */}
          <Card>
            <CardHeader>
              <CardTitle>Safe Campus Meetup Location</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-full min-h-[500px] bg-gradient-to-br from-green-50 to-blue-50">
                {/* Mock Map Interface */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full p-8">
                    {/* Campus map mockup */}
                    <div className="absolute inset-8 border-2 border-gray-300 rounded-lg bg-white/50">
                      {/* Location pins */}
                      <div className="absolute top-1/4 left-1/3 flex flex-col items-center">
                        <div className="bg-blue-600 text-white rounded-full p-2 shadow-lg">
                          <MapPin className="h-6 w-6" />
                        </div>
                        <span className="text-xs mt-1 bg-white px-2 py-1 rounded shadow">
                          You
                        </span>
                      </div>

                      <div className="absolute top-1/2 right-1/3 flex flex-col items-center">
                        <div className="bg-orange-600 text-white rounded-full p-2 shadow-lg">
                          <MapPin className="h-6 w-6" />
                        </div>
                        <span className="text-xs mt-1 bg-white px-2 py-1 rounded shadow">
                          Sarah
                        </span>
                      </div>

                      {/* Safe zone - Library */}
                      <div className="absolute top-2/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="bg-green-600 text-white rounded-full p-3 shadow-xl animate-pulse">
                          <MapPin className="h-8 w-8" />
                        </div>
                        <div className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
                          <p className="text-sm">Safe Campus Zone</p>
                          <p>Main Library</p>
                        </div>
                      </div>

                      {/* Route lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line
                          x1="33%"
                          y1="25%"
                          x2="50%"
                          y2="66%"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        <line
                          x1="66%"
                          y1="50%"
                          x2="50%"
                          y2="66%"
                          stroke="#f97316"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                      </svg>
                    </div>

                    {/* Campus labels */}
                    <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow">
                      <p className="text-sm">UTAR Kampar Campus</p>
                    </div>

                    <div className="absolute bottom-4 right-4 space-y-2">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
