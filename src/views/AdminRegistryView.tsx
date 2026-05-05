import * as React from "react";
import { Voter } from "@/src/types";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Search, Filter, ShieldCheck, AlertCircle, Upload } from "lucide-react";
import { cn } from "@/src/lib/utils";

const VOTERS: Voter[] = [
  { id: '1', name: 'James Wilson', email: 'j.wilson@mail.gov', registrationDate: '2024-01-12', status: 'Verified', photoUrl: 'https://picsum.photos/seed/v1/100/100' },
  { id: '2', name: 'Maria Garcia', email: 'm.garcia@mail.gov', registrationDate: '2024-02-05', status: 'Verified', photoUrl: 'https://picsum.photos/seed/v2/100/100' },
  { id: '3', name: 'Robert Lee', email: 'r.lee@mail.gov', registrationDate: '2024-02-14', status: 'Pending Review', photoUrl: 'https://picsum.photos/seed/v3/100/100' },
  { id: '4', name: 'Sarah Chen', email: 's.chen@mail.gov', registrationDate: '2024-03-01', status: 'Flagged', photoUrl: 'https://picsum.photos/seed/v4/100/100' },
];

const DEFAULT_PHOTO_URL = 'https://picsum.photos/seed/voter/100/100';

function normalizeStatus(value: string | undefined): Voter['status'] {
  const status = value?.trim().toLowerCase();

  if (status === 'verified') return 'Verified';
  if (status === 'flagged') return 'Flagged';
  return 'Pending Review';
}

function parseCsvValue(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/""/g, '"').trim();
  }

  return trimmed;
}

function parseCsv(text: string): Voter[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());

  return lines.slice(1).map((line, index) => {
    const cells = line.match(/("(?:[^"]|"")*"|[^,]+)/g)?.map(parseCsvValue) ?? [];
    const record = Object.fromEntries(headers.map((header, headerIndex) => [header, cells[headerIndex] ?? '']));
    const id = record.id || record.voterid || `csv-${index + 1}`;

    return {
      id,
      name: record.name || 'Unnamed Voter',
      email: record.email || `${id}@example.com`,
      registrationDate: record.registrationdate || record.registeredat || new Date().toISOString().slice(0, 10),
      status: normalizeStatus(record.status),
      photoUrl: record.photourl || DEFAULT_PHOTO_URL,
    };
  });
}

export function AdminRegistryView() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [voters, setVoters] = React.useState<Voter[]>(VOTERS);
  const [searchDraft, setSearchDraft] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null);

  const filteredVoters = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return voters;
    }

    return voters.filter((voter) => {
      return [voter.id, voter.name, voter.email, voter.status, voter.registrationDate]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [searchQuery, voters]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(searchDraft);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    const importedVoters = parseCsv(text);

    if (!importedVoters.length) {
      setUploadMessage('The CSV did not include any voter rows.');
      event.target.value = '';
      return;
    }

    setVoters((currentVoters) => {
      const merged = new Map(currentVoters.map((voter) => [voter.id, voter]));

      importedVoters.forEach((voter) => {
        merged.set(voter.id, voter);
      });

      return Array.from(merged.values());
    });
    setUploadMessage(`Imported ${importedVoters.length} voter${importedVoters.length === 1 ? '' : 's'}.`);
    event.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tight text-on-surface">Voter Registry</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 font-bold" onClick={handleUploadClick} type="button">
            <Upload size={18} />
            Upload CSV
          </Button>
          <Button className="font-bold" type="button">Register New Voter</Button>
        </div>
      </div>

      <Card className="p-4 bg-surface-container-low space-y-3">
        <form className="flex gap-4" onSubmit={handleSearch}>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              className="w-full h-10 pl-10 pr-4 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Search by name, ID, email, status, or date..."
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
            />
          </div>
          <Button variant="secondary" className="gap-2 font-bold" type="submit">
            <Search size={18} />
            Search
          </Button>
          <Button variant="outline" className="gap-2 font-bold" type="button">
            <Filter size={18} />
            Filters
          </Button>
        </form>
        <input
          ref={fileInputRef}
          type="file"
          accept="text/csv,.csv"
          className="hidden"
          onChange={handleCsvUpload}
        />
        {uploadMessage ? (
          <p className="text-xs font-bold text-on-surface-variant">{uploadMessage}</p>
        ) : null}
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
              <th className="px-6 py-4">Voter Identity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Registration Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {filteredVoters.length ? filteredVoters.map((voter) => (
              <tr key={voter.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img alt={voter.name} src={voter.photoUrl} className="w-10 h-10 rounded-full border border-outline-variant/30 grayscale group-hover:grayscale-0 transition-all" />
                    <div>
                      <p className="font-bold text-on-surface">{voter.name}</p>
                      <p className="text-xs text-on-surface-variant">{voter.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                    voter.status === 'Verified' ? "bg-green-100 text-green-700" : 
                    voter.status === 'Flagged' ? "bg-error-container text-error" : "bg-yellow-100 text-yellow-700"
                  )}>
                    {voter.status === 'Verified' ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                    {voter.status}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-on-surface-variant">{voter.registrationDate}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="font-bold text-secondary" type="button">Manage</Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td className="px-6 py-8 text-center text-sm text-on-surface-variant" colSpan={4}>
                  No voters match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
