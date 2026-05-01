import * as React from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Election, Candidate, AppView } from "@/src/types";

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
  const [ballotType, setBallotType] = React.useState<"single" | "multi">("single");
  const [maxVotes, setMaxVotes] = React.useState<number>(1);

  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [candName, setCandName] = React.useState("");
  const [candDept, setCandDept] = React.useState("");
  const [candPhotoFile, setCandPhotoFile] = React.useState<File | null>(null);

  const addCandidate = async () => {
    if (!candName.trim()) return;
    let photoUrl = `https://picsum.photos/seed/${encodeURIComponent(candName)}/200/200`;
    if (candPhotoFile) {
      photoUrl = await fileToDataUrl(candPhotoFile);
    }
    const candidate: Candidate = {
      id: crypto.randomUUID(),
      name: candName,
      party: candDept || "",
      description: "",
      photoUrl,
      platform: [],
      voteCount: 0,
    };
    setCandidates((c) => [...c, candidate]);
    setCandName("");
    setCandDept("");
    setCandPhotoFile(null);
  };

  const removeCandidate = (id: string) => setCandidates((c) => c.filter((x) => x.id !== id));

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
      voteCount: 0,
      candidates,
    };

    onCreate(election);
    onCancel?.();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">Create Election</h1>
        <div className="text-sm text-on-surface-variant">Only institute students allowed to vote</div>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Election Title" className="p-3 border rounded" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g., General)" className="p-3 border rounded" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="p-3 border rounded" />

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <label className="flex flex-col">
              <span className="text-xs font-black text-on-surface-variant uppercase">Ballot Type</span>
              <select value={ballotType} onChange={(e) => setBallotType(e.target.value as any)} className="p-2 border rounded">
                <option value="single">Single-choice</option>
                <option value="multi">Multi-choice</option>
              </select>
            </label>
            <label className="flex flex-col">
              <span className="text-xs font-black text-on-surface-variant uppercase">Max Votes Per Voter</span>
              <input type="number" min={1} value={maxVotes} onChange={(e) => setMaxVotes(Number(e.target.value) || 1)} className="p-2 border rounded" />
            </label>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <h2 className="text-xl font-black mb-3">Candidates</h2>
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={candName} onChange={(e) => setCandName(e.target.value)} placeholder="Candidate name" className="p-2 border rounded" />
            <input value={candDept} onChange={(e) => setCandDept(e.target.value)} placeholder="Department / Course" className="p-2 border rounded" />
            <input type="file" accept="image/*" onChange={(e) => setCandPhotoFile(e.target.files?.[0] ?? null)} className="p-2" />
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={addCandidate}>Add Candidate</Button>
            <Button variant="outline" onClick={() => { setCandName(""); setCandDept(""); setCandPhotoFile(null); }}>Clear</Button>
          </div>
        </Card>

        <div className="space-y-2">
          {candidates.map((c) => (
            <Card key={c.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={c.photoUrl} className="w-12 h-12 object-cover rounded-md" />
                <div>
                  <div className="font-bold">{c.name}</div>
                  <div className="text-sm text-on-surface-variant">{c.party}</div>
                </div>
              </div>
              <div>
                <Button variant="ghost" onClick={() => removeCandidate(c.id)}>Remove</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button onClick={submit}>Create Election</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
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
