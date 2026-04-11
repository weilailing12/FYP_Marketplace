import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Send, MapPin, Navigation, Paperclip, X, Calendar, Clock } from "lucide-react";
import { Badge } from "./ui/badge";

interface Message {
  id: string;
  sender: "me" | "other";
  text: string;
  timestamp: string;
  imageUrl?: string;
  isMeetupProposal?: boolean; 
}

interface ChatMeetupProps {
  onNavigate: (page: string) => void;
}

export function ChatMeetup({ onNavigate }: ChatMeetupProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "other", text: "Hi! Is this MacBook still available?", timestamp: "10:30 AM" },
    { id: "2", sender: "me", text: "Yes, it's still available! Are you interested?", timestamp: "10:32 AM" },
  ]);

  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const [meetupType, setMeetupType] = useState("pickup");
  const [meetupLocation, setMeetupLocation] = useState("library");
  const [meetupTime, setMeetupTime] = useState("");

  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---> THIS IS THE CRITICAL FUNCTION THAT WAS MISSING! <---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAttachedImage(previewUrl);
    }
  };
  // ---------------------------------------------------------

  const handleSendMessage = (textOverride?: string, isProposal = false) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() && !attachedImage) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: attachedImage || undefined,
      isMeetupProposal: isProposal
    };

    setMessages([...messages, newMessage]);
    setInputText("");
    setAttachedImage(null);
    setShowMeetupModal(false);
  };

  const confirmMeetup = () => {
    const proposalText = `📅 Proposed ${meetupType.toUpperCase()}:\n📍 Location: ${meetupLocation}\n⏰ Time: ${meetupTime}`;
    handleSendMessage(proposalText, true);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* --- MEETUP RESERVATION MODAL --- */}
      {showMeetupModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Schedule Meetup</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowMeetupModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select value={meetupType} onValueChange={setMeetupType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Self Pickup</SelectItem>
                    <SelectItem value="dropoff">Seller Dropoff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Campus Pickup Point</Label>
                <Select value={meetupLocation} onValueChange={setMeetupLocation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Library">Main Library (Safe Zone)</SelectItem>
                    <SelectItem value="BlockG">Block G Café</SelectItem>
                    <SelectItem value="Gym">Campus Gym Entrance</SelectItem>
                    <SelectItem value="StudentPavilion">Student Pavilion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="time" 
                    className="pl-10" 
                    value={meetupTime}
                    onChange={(e) => setMeetupTime(e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700 mt-4" onClick={confirmMeetup}>
                Send Proposal
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => onNavigate('product')} className="mb-4">← Back</Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)]">
          {/* Chat Side */}
          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback className="bg-blue-600 text-white">SC</AvatarFallback></Avatar>
                <div>
                  <CardTitle className="text-lg">Sarah Chen</CardTitle>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    m.isMeetupProposal ? "bg-green-50 border-2 border-green-200 text-green-900" : 
                    m.sender === "me" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                  }`}>
                    {m.imageUrl && <img src={m.imageUrl} className="w-full rounded-md mb-2" alt="attachment" />}
                    <p className="whitespace-pre-line">{m.text}</p>
                    <p className="text-[10px] mt-1 opacity-70">{m.timestamp}</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-center py-4">
                <Button onClick={() => setShowMeetupModal(true)} variant="outline" className="border-blue-600 text-blue-600">
                  <Calendar className="h-4 w-4 mr-2" /> Propose Meetup / Reservation
                </Button>
              </div>
            </CardContent>

            <div className="p-4 border-t bg-white">
              {attachedImage && (
                <div className="mb-3 relative inline-block">
                  <img src={attachedImage} className="h-20 w-20 object-cover rounded-md" alt="preview" />
                  <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
                </div>
              )}
              <div className="flex gap-2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-5 w-5" /></Button>
                <Input placeholder="Type a message..." className="flex-1" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                <Button className="bg-blue-600" onClick={() => handleSendMessage()}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>

          {/* Map Side (UTAR Kampar Mockup) */}
          <Card className="hidden lg:block">
            <CardHeader><CardTitle>UTAR Kampar Safe Meetup Zones</CardTitle></CardHeader>
            <CardContent className="p-0 relative h-[500px] bg-blue-50/50">
               <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-xl">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Interactive Campus Map View</p>
                    <Badge variant="outline" className="mt-2">Kampar Campus</Badge>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}