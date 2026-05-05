import * as React from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Candidate, Election } from "@/src/types";

interface Props {
  elections: Election[];
  onCreateCandidate: (electionId: string, candidate: Candidate) => void;
  onCancel?: () => void;
}

export function AdminCreateCandidateView({ elections, onCreateCandidate, onCancel }: Props) {
  const [electionId, setElectionId] = React.useState("");
  const [name, setName] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [priorityOne, setPriorityOne] = React.useState("");
  const [priorityTwo, setPriorityTwo] = React.useState("");
  const [priorityThree, setPriorityThree] = React.useState("");
  const [photoPreview, setPhotoPreview] = React.useState("");
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);

  const handlePhotoChange = async (file: File | null) => {
    setPhotoFile(file);
    if (!file) {
      setPhotoPreview("");
      return;
    }
    setPhotoPreview(await fileToDataUrl(file));
  };

  const submit = async () => {
    if (!electionId || !name.trim()) return;

    let photoUrl = photoPreview || `https://picsum.photos/seed/${encodeURIComponent(name)}/200/200`;
    if (photoFile && !photoPreview) {
      photoUrl = await fileToDataUrl(photoFile);
    }

    const candidate: Candidate = {
      id: crypto.randomUUID(),
      name: name.trim(),
      party: department || "Department / Course",
      description: bio || "",
      photoUrl,
      platform: [priorityOne, priorityTwo, priorityThree].filter(Boolean),
      voteCount: 0,
    };

    onCreateCandidate(electionId, candidate);
    setElectionId("");
    setName("");
    setDepartment("");
    setBio("");
    setPriorityOne("");
    setPriorityTwo("");
    setPriorityThree("");
    setPhotoPreview("");
    setPhotoFile(null);
    onCancel?.();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-black">Create Candidate</h1>
        <div className="text-sm text-on-surface-variant max-w-md sm:text-right">
          Add a candidate to an existing election
        </div>
      </div>

      <Card className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-black text-on-surface-variant uppercase">Target Election</span>
            <select value={electionId} onChange={(e) => setElectionId(e.target.value)} className="p-3 border rounded w-full bg-white">
              <option value="">Select election</option>
              {elections.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.title} ({election.status})
                </option>
              ))}
            </select>
          </label>

          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Candidate name" className="p-3 border rounded w-full" />
          <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department or Course" className="p-3 border rounded w-full" />
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Candidate bio" className="p-3 border rounded w-full min-h-28" />

          <div className="space-y-2">
            <span className="text-xs font-black text-on-surface-variant uppercase">Photo Upload</span>
            <input type="file" accept="image/*" onChange={(e) => void handlePhotoChange(e.target.files?.[0] ?? null)} className="w-full p-2 border rounded bg-white" />
            {photoPreview && (
              <div className="rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container">
                <img src={photoPreview} alt="Candidate preview" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={priorityOne} onChange={(e) => setPriorityOne(e.target.value)} placeholder="Priority 1" className="p-3 border rounded w-full" />
            <input value={priorityTwo} onChange={(e) => setPriorityTwo(e.target.value)} placeholder="Priority 2" className="p-3 border rounded w-full" />
            <input value={priorityThree} onChange={(e) => setPriorityThree(e.target.value)} placeholder="Priority 3" className="p-3 border rounded w-full" />
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={submit} className="w-full sm:w-auto">Create Candidate</Button>
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

export default AdminCreateCandidateView;
