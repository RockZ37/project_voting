import { useState } from "react";
import { motion } from "motion/react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { api } from "@/src/lib/api";

interface Props {
  onClose: () => void;
  onUploaded?: (stats: { inserted: number; updated: number; total: number }) => void;
}

export function AdminUploadRegistryView({ onClose, onUploaded }: Props) {
  const [csvText, setCsvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ inserted: number; updated: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setError(null);
      setSuccess(null);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!csvText.trim()) {
      setError("Please select a CSV file or paste content");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await api.uploadRegistry(csvText);
      setSuccess(result.stats);
      onUploaded?.(result.stats);
      setCsvText("");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Upload failed";
      const message = /Only admins can upload registry|Authentication required/i.test(raw)
        ? "Your session is not authorized for registry upload. Log out and sign in with an admin account."
        : raw;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="bg-white max-w-full w-full sm:max-w-md shadow-xl mx-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="flex justify-center pt-6">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </motion.div>

          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registry Uploaded Successfully</h2>

            <div className="grid grid-cols-3 gap-4 my-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{success.inserted}</p>
                <p className="text-sm text-gray-600 mt-1">Added</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">{success.updated}</p>
                <p className="text-sm text-gray-600 mt-1">Updated</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{success.total}</p>
                <p className="text-sm text-gray-600 mt-1">Total</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">Student registry has been updated successfully</p>

            <div className="space-y-3">
              <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                Close
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="bg-white max-w-full w-full sm:max-w-2xl mx-2 sm:mx-auto shadow-xl h-full sm:h-auto overflow-auto">
        <div className="p-4 sm:p-8">
          <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Student Registry</h2>
            <p className="text-gray-600">CSV format: index_number, name, course, profile_picture_url, date, issue_date, valid_until</p>
          </motion.div>

          <div className="space-y-6">
            {/* CSV File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center w-full h-32 sm:h-40 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors bg-gray-50">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to select or drag and drop <br /> your CSV file
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Or Paste CSV */}
            <div>
              <label htmlFor="csvPaste" className="block text-sm font-medium text-gray-700 mb-2">
                Or Paste CSV Content
              </label>
              <textarea
                id="csvPaste"
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  setError(null);
                }}
                placeholder="index_number,name,course,profile_picture_url,date,issue_date,valid_until
STU001,John Doe,Computer Science,https://example.com/photo.jpg,2024-01-15,2024-01-01,2025-12-31
STU002,Jane Smith,Engineering,https://example.com/photo2.jpg,2024-01-15,2024-01-01,2025-12-31"
                className="w-full h-48 sm:h-56 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <Button onClick={onClose} variant="outline" disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={loading || !csvText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                {loading ? "Uploading..." : "Upload Registry"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
