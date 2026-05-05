import * as React from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Election } from "@/src/types";

interface Props {
  onCreate: (election: Election) => void;
  onCancel?: () => void;
}

export function AdminCreateElectionView({ onCreate, onCancel }: Props) {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startAt, setStartAt] = React.useState<string | null>(null);
  const [endAt, setEndAt] = React.useState<string | null>(null);
  const [department, setDepartment] = React.useState("");
  const [bannerPreview, setBannerPreview] = React.useState<string>("");

  const handleBannerChange = async (file: File | null) => {
    if (!file) {
      setBannerPreview("");
      return;
    }
    setBannerPreview(await fileToDataUrl(file));
  };

  const submit = () => {
    if (!title.trim()) return;
    const now = new Date();
    const start = startAt ? new Date(startAt) : now;
    const end = endAt ? new Date(endAt) : new Date(start.getTime() + 1000 * 60 * 60 * 24);
    const status: Election["status"] = start <= now && end > now ? "Open" : "Upcoming";

    const election: Election = {
      id: crypto.randomUUID(),
      title: title.trim(),
      category: category || "General",
      description: description || "",
      status,
      ballotType: "single",
      maxVotesPerVoter: 1,
      bannerUrl: bannerPreview || undefined,
      voteCount: 0,
      candidates: [],
    };

    onCreate(election);
    onCancel?.();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-black">Create Election</h1>
        <div className="text-sm text-on-surface-variant max-w-md sm:text-right">
          Only institute students allowed to vote
        </div>
      </div>

      <Card className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Election Title" className="p-3 border rounded w-full" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g., General)" className="p-3 border rounded w-full" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="p-3 border rounded w-full min-h-28" />

          <div className="space-y-2">
            <span className="text-xs font-black text-on-surface-variant uppercase">Election Banner</span>
            <input type="file" accept="image/*" onChange={(e) => void handleBannerChange(e.target.files?.[0] ?? null)} className="w-full p-2 border rounded bg-white" />
            {bannerPreview && (
              <div className="rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container">
                <img src={bannerPreview} alt="Election banner preview" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-xs font-black text-on-surface-variant uppercase">Start</span>
              <input type="datetime-local" onChange={(e) => setStartAt(e.target.value || null)} className="p-2 border rounded" />
            </label>
            <label className="flex flex-col">
              <span className="text-xs font-black text-on-surface-variant uppercase">End</span>
              <input type="datetime-local" onChange={(e) => setEndAt(e.target.value || null)} className="p-2 border rounded" />
            </label>
          </div>

          <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department or Course (comma-separated)" className="p-3 border rounded" />
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={submit} className="w-full sm:w-auto">Create Election</Button>
        <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
      </div>
    </div>
  );
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.readAsDataURL(file);
  });
}

export default AdminCreateElectionView;
