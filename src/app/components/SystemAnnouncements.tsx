import { useEffect, useState } from "react";
import { ExternalLink, FileText, Megaphone, X } from "lucide-react";
import { supabase } from "../../supabase";

interface Announcement {
  id: string;
  title: string;
  description: string;
  pdf_url?: string | null;
}

export function SystemAnnouncements() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchAnnouncement() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (profile?.is_admin) return;
      const { data } = await supabase.from("announcements").select("id, title, description, pdf_url").eq("is_published", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data) setAnnouncement(data);
    }
    fetchAnnouncement();
  }, []);

  if (!announcement || dismissed) return null;

  return (
    <section className="border-b border-blue-200 bg-blue-50" aria-label="System announcement">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-3">
        <Megaphone className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-blue-950">{announcement.title}</h2>
          <p className="text-sm text-blue-900 mt-0.5 whitespace-pre-wrap">{announcement.description}</p>
          {announcement.pdf_url && <a href={announcement.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900 mt-2"><FileText className="h-4 w-4" /> View attached PDF <ExternalLink className="h-3.5 w-3.5" /></a>}
        </div>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss announcement" className="text-blue-700 hover:text-blue-950 p-1"><X className="h-4 w-4" /></button>
      </div>
    </section>
  );
}