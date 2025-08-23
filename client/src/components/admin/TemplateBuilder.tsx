import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessCard, Template } from "@shared/schema";

/**
 * Helper: read ?edit=<templateId> from URL (Wouter ব্যবহার করছেন, তাই window.location যথেষ্ট)
 */
function useEditId() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("edit");
  }, []);
}

export default function TemplateBuilder() {
  const editId = useEditId();

  // BusinessCard স্টেট—খালি/null থেকে শুরু; ডাটা এলে হাইড্রেট হবে
  const [card, setCard] = useState<BusinessCard | null>(null);

  // সার্ভার থেকে টেমপ্লেট (এডিট মোডে)
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(!!editId);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initial fallback (create-new preview) — BusinessCard টাইপে যেগুলো নেই সেগুলো রাখি না
  const initialCard: BusinessCard = {
    fullName: "John Doe",
    title: "Software Engineer",
    company: "Tech Company",
    about: "Passionate software engineer with 5+ years of experience building web applications.",
    phone: "+1 (555) 123-4567",
    email: "john@example.com",
    website: "https://johndoe.com",
    linkedin: "https://linkedin.com/in/johndoe",
    customContacts: [],
    customSocials: [],
    pageElements: [],
    brandColor: "#21c45d",   // primary
    accentColor: "#0f172a",  // secondary
    template: "minimal",
    headerDesign: "cover-logo",
    backgroundColor: "#ffffff",
    headingColor: "#1f2937",
    paragraphColor: "#4b5563",
    availableIcons: [],
    galleryImages: [],
  };

  useEffect(() => {
    // এডিট না হলে ডিফল্ট প্রিভিউ দেখাই
    if (!editId) {
      setCard(initialCard);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // আপনার API রুট— প্রয়োজনমত সমন্বয় করুন
        const res = await fetch(`/api/admin/templates/${editId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Template not found");
          throw new Error("Failed to load template");
        }
        const data = await res.json();
        if (cancelled) return;

        const t: Template = {
          id: data.id,
          name: data.name,
          description: data.description ?? "",
          category: data.category ?? "business",
          isActive: !!data.isActive,
          templateData: data.templateData,
        };
        setTemplate(t);

        // templateData string বা object— দুই-ভাবেই আসতে পারে
        let incoming: unknown = t.templateData;
        if (typeof incoming === "string") {
          try {
            incoming = JSON.parse(incoming);
          } catch {
            incoming = {};
          }
        }

        // শেষ পর্যন্ত BusinessCard-এ merge
        setCard({ ...initialCard, ...(incoming as Partial<BusinessCard>) });
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
        setCard(initialCard);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleChange =
    (field: keyof BusinessCard) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCard((prev) => (prev ? { ...prev, [field]: e.target.value } : prev));
    };

  const handleSave = async () => {
    if (!card) return;
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: template?.name ?? "Untitled",
        description: template?.description ?? "",
        isActive: template?.isActive ?? true,
        category: template?.category ?? "business",
        templateData: card, // সার্ভারে JSON হিসেবে সেভ করুন
      };

      const url = editId ? `/api/admin/templates/${editId}` : `/api/admin/templates`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to save template");
      }
      alert("Template saved successfully.");
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Template Builder</h1>
        <div className="flex items-center gap-3">
          {editId ? <span className="text-sm opacity-70">Editing ID: {editId}</span> : null}
          <Button className="bg-brand text-white" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Editor panel */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Update text fields, colors & links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={card?.fullName ?? ""} onChange={handleChange("fullName")} />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={card?.title ?? ""} onChange={handleChange("title")} />
              </div>
              <div>
                <Label>Company</Label>
                <Input value={card?.company ?? ""} onChange={handleChange("company")} />
              </div>
              <div>
                <Label>About</Label>
                <Textarea rows={3} value={card?.about ?? ""} onChange={handleChange("about")} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Phone</Label>
                  <Input value={card?.phone ?? ""} onChange={handleChange("phone")} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={card?.email ?? ""} onChange={handleChange("email")} />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={card?.website ?? ""} onChange={handleChange("website")} />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input value={card?.linkedin ?? ""} onChange={handleChange("linkedin")} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label>Brand Color</Label>
                  <Input value={card?.brandColor ?? "#21c45d"} onChange={handleChange("brandColor")} />
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <Input value={card?.accentColor ?? "#0f172a"} onChange={handleChange("accentColor")} />
                </div>
                <div>
                  <Label>Background</Label>
                  <Input value={card?.backgroundColor ?? "#ffffff"} onChange={handleChange("backgroundColor")} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>What your eCard looks like</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-xl p-6"
              style={{
                background: card?.backgroundColor ?? "#ffffff",
                color: card?.paragraphColor ?? "#334155",
                border: `2px solid ${card?.accentColor ?? "#0f172a"}`,
              }}
            >
              <div
                className="rounded-lg p-4 text-white"
                style={{ background: card?.brandColor ?? "#21c45d" }}
              >
                <div className="text-xl font-semibold">{card?.fullName || "Full Name"}</div>
                <div className="opacity-90">{card?.title || "Title"}</div>
                <div className="opacity-90">{card?.company || "Company"}</div>
              </div>

              <div className="mt-4 space-y-1">
                {card?.about ? <p>{card.about}</p> : <p>Tell people who you are…</p>}
                <div className="mt-3 text-sm">
                  {card?.phone ? <div>📞 {card.phone}</div> : null}
                  {card?.email ? <div>✉️ {card.email}</div> : null}
                  {card?.website ? <div>🌐 {card.website}</div> : null}
                  {card?.linkedin ? <div>🔗 {card.linkedin}</div> : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
