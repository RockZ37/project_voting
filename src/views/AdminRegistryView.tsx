import * as React from "react";
import { Voter } from "@/src/types";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Search, Filter, ShieldCheck, AlertCircle, Upload } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { api } from "@/src/lib/api";

export function AdminRegistryView() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [voters, setVoters] = React.useState<Voter[]>([]);
  const [searchDraft, setSearchDraft] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const loadVoters = React.useCallback(async (query = "") => {
    setLoading(true);
    try {
      const data = await api.getVoters(query);
      setVoters(data);
    } catch (error: any) {
      setUploadMessage(error.message || "Failed to load voters");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadVoters();
  }, [loadVoters]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(searchDraft);
    void loadVoters(searchDraft);
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

    try {
      const result = await api.importVotersCsv(text);
      setUploadMessage(`Imported ${result.imported} voter${result.imported === 1 ? "" : "s"}.`);
      await loadVoters(searchQuery);
    } catch (error: any) {
      setUploadMessage(error.message || "CSV import failed.");
    }

    event.target.value = "";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tight text-on-surface">Voter Registry</h1>
        <Button variant="outline" className="gap-2 font-bold" onClick={handleUploadClick} type="button">
          <Upload size={18} />
          Upload CSV
        </Button>
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
          <Button variant="secondary" className="gap-2 font-bold" type="submit" disabled={loading}>
            <Search size={18} />
            Search
          </Button>
          <Button variant="outline" className="gap-2 font-bold" type="button" onClick={() => void loadVoters(searchQuery)}>
            <Filter size={18} />
            Refresh
          </Button>
        </form>
        <input
          ref={fileInputRef}
          type="file"
          accept="text/csv,.csv"
          className="hidden"
          onChange={handleCsvUpload}
        />
        {uploadMessage ? <p className="text-xs font-bold text-on-surface-variant">{uploadMessage}</p> : null}
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
            {voters.length ? (
              voters.map((voter) => (
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
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        voter.status === "Verified"
                          ? "bg-green-100 text-green-700"
                          : voter.status === "Flagged"
                            ? "bg-error-container text-error"
                            : "bg-yellow-100 text-yellow-700"
                      )}
                    >
                      {voter.status === "Verified" ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                      {voter.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-on-surface-variant">{voter.registrationDate || "-"}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="font-bold text-secondary" type="button">
                      Manage
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-8 text-center text-sm text-on-surface-variant" colSpan={4}>
                  {loading ? "Loading voters..." : "No voters found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
