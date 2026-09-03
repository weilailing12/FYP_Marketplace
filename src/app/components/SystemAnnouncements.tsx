import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, FileText, Megaphone, X } from "lucide-react";
import { supabase } from "../../supabase";

interface Announcement {
  id: string;
  title: string;
  description: string;
  pdf_url?: string | null;
  image_url?: string | null;
}

export function SystemAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchAnnouncement() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Announcement auth check failed:", userError);
        return;
      }
      if (!user) {
        console.error("Announcement loading stopped: no authenticated user.");
        return;
      }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (profileError) console.error("Announcement profile check failed:", profileError);
      if (profile?.is_admin) return;
      const { data, error: announcementError } = await supabase.from("announcements").select("id, title, description, pdf_url, image_url").eq("is_published", true).order("created_at", { ascending: false });
      if (announcementError) {
        console.error("Announcement query failed:", announcementError);
        return;
      }
      console.log(`Published announcements loaded for student: ${data?.length ?? 0}`);
      if (data) setAnnouncements(data);
    }
    fetchAnnouncement();
  }, []);

  if (announcements.length === 0 || dismissed) return null;
  const announcement = announcements[selectedIndex];

  return (
    <section className="border-b border-blue-200 bg-blue-50" aria-label="System announcement">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-3">
        <Megaphone className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
        {announcement.image_url && <img src={announcement.image_url} alt="" className="h-14 w-14 rounded-md object-cover flex-shrink-0" />}
        <button onClick={() => setSelectedAnnouncement(announcement)} className="min-w-0 flex-1 text-left hover:opacity-80">
          <h2 className="font-semibold text-blue-950">{announcement.title}</h2>
          <p className="text-sm text-blue-900 mt-0.5 line-clamp-2">{announcement.description}</p>
          <span className="text-xs font-medium text-blue-700 mt-1 inline-block">Click to read full announcement</span>
        </button>
        {announcements.length > 1 && <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setSelectedIndex((selectedIndex - 1 + announcements.length) % announcements.length)} aria-label="Previous announcement" className="p-1 text-blue-700 hover:bg-blue-100 rounded"><ChevronLeft className="h-5 w-5" /></button>
          <span className="text-xs text-blue-800 whitespace-nowrap">{selectedIndex + 1} / {announcements.length}</span>
          <button onClick={() => setSelectedIndex((selectedIndex + 1) % announcements.length)} aria-label="Next announcement" className="p-1 text-blue-700 hover:bg-blue-100 rounded"><ChevronRight className="h-5 w-5" /></button>
        </div>}
        <button onClick={() => setDismissed(true)} aria-label="Dismiss announcement" className="text-blue-700 hover:text-blue-950 p-1"><X className="h-4 w-4" /></button>
      </div>
      {selectedAnnouncement && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={selectedAnnouncement.title} onClick={() => setSelectedAnnouncement(null)}>
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4 p-5 border-b"><h2 className="text-xl font-bold text-gray-900">{selectedAnnouncement.title}</h2><button onClick={() => setSelectedAnnouncement(null)} aria-label="Close announcement" className="text-gray-500 hover:text-gray-900"><X className="h-5 w-5" /></button></div>
          {selectedAnnouncement.image_url && <img src={selectedAnnouncement.image_url} alt="" className="w-full max-h-72 object-cover" />}
          <div className="p-5"><p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedAnnouncement.description}</p>{selectedAnnouncement.pdf_url && <a href={selectedAnnouncement.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900 mt-5"><FileText className="h-4 w-4" /> View attached PDF <ExternalLink className="h-3.5 w-3.5" /></a>}</div>
        </div>
      </div>}
    </section>
  );
}