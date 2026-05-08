import * as React from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Search, Filter, AlertCircle, Upload } from "lucide-react";
import { api } from "@/src/lib/api";
import { AdminUploadRegistryView } from "./AdminUploadRegistryView";

type RegistryStudent = {
  id: string;
  index_number: string;
  name: string;
  course?: string;
  profile_photo_url?: string;
  issue_date?: string;
  valid_until?: string;
  status?: string;
};

function isExpired(validUntil?: string) {
  if (!validUntil) return false;
  const d = new Date(validUntil);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function AdminRegistryView() {
  const [students, setStudents] = React.useState<RegistryStudent[]>([]);
  const [searchDraft, setSearchDraft] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null);
  const [showStudentRegistryUpload, setShowStudentRegistryUpload] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const loadRegistry = React.useCallback(async (query = "") => {
    setLoading(true);
    try {
      const data = await api.getRegistryStudents(query);
      setStudents(data);
    } catch (error: any) {
      setUploadMessage(error.message || "Failed to load registry records");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadRegistry();
  }, [loadRegistry]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(searchDraft);
    void loadRegistry(searchDraft);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tight text-on-surface">Student Registry</h1>
        <Button variant="outline" className="gap-2 font-bold" onClick={() => setShowStudentRegistryUpload(true)} type="button">
          <Upload size={18} />
          Upload Student Registry
        </Button>
      </div>

      {showStudentRegistryUpload && (
        <AdminUploadRegistryView
          onClose={() => setShowStudentRegistryUpload(false)}
          onUploaded={(stats) => {
            setUploadMessage(`Saved ${stats.total} student record${stats.total === 1 ? "" : "s"} (${stats.inserted} added, ${stats.updated} updated).`);
            void loadRegistry(searchQuery);
          }}
        />
      )}

      <Card className="p-4 bg-surface-container-low space-y-3">
        <form className="flex gap-4" onSubmit={handleSearch}>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input
              className="w-full h-10 pl-10 pr-4 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Search by index number, name, course, or status..."
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
            />
          </div>
          <Button variant="secondary" className="gap-2 font-bold" type="submit" disabled={loading}>
            <Search size={18} />
            Search
          </Button>
          <Button variant="outline" className="gap-2 font-bold" type="button" onClick={() => void loadRegistry(searchQuery)}>
            <Filter size={18} />
            Refresh
          </Button>
        </form>
        {uploadMessage ? <p className="text-xs font-bold text-on-surface-variant">{uploadMessage}</p> : null}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px] border-collapse">
          <thead>
            <tr className="bg-surface-container text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Index Number</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Valid Until</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {students.length ? (
              students.map((student) => {
                const expired = isExpired(student.valid_until);
                const status = expired ? "expired" : (student.status || "active");
                return (
                <tr key={student.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img alt={student.name} src={student.profile_photo_url || "https://picsum.photos/seed/student/100/100"} className="w-10 h-10 rounded-full border border-outline-variant/30 grayscale group-hover:grayscale-0 transition-all object-cover" />
                      <div>
                        <p className="font-bold text-on-surface">{student.name}</p>
                        <p className="text-xs text-on-surface-variant">Issued: {student.issue_date || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-on-surface-variant">{student.index_number}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-on-surface-variant">{student.course || "-"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-on-surface-variant">{student.valid_until || "-"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        status === "active"
                          ? "bg-green-100 text-green-700"
                          : status === "expired"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {status === "active" ? "Active" : status}
                    </div>
                  </td>
                </tr>
              )})
            ) : (
              <tr>
                <td className="px-6 py-8 text-center text-sm text-on-surface-variant" colSpan={5}>
                  {loading ? "Loading registry records..." : "No registry records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
