import { useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, CheckCircle2, User, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card } from "@/src/components/ui/Card";
import { api } from "@/src/lib/api";

interface Student {
  id: string;
  index_number: string;
  name: string;
  course: string;
  profile_photo_url?: string;
  issue_date?: string;
  valid_until?: string;
}

interface Props {
  onLookupComplete: (indexNumber: string) => void;
  onCancel: () => void;
}

function isValidHtuIndexNumber(value: string) {
  return /^032\d{7}$/.test(value.trim());
}

export function RegistryLookupView({ onLookupComplete, onCancel }: Props) {
  const [indexNumber, setIndexNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    const trimmed = indexNumber.trim();
    if (!trimmed) {
      setError("Please enter your HTU index number");
      return;
    }

    if (!isValidHtuIndexNumber(trimmed)) {
      setError("HTU index number must start with 032 and contain 10 digits total");
      return;
    }

    setLoading(true);
    setError(null);
    setFound(null);

    try {
      const student = await api.lookupStudent(trimmed);
      setFound(student);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Student not found or registration expired";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (found) {
      onLookupComplete(found.index_number);
    }
  };

  if (found) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-xl">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="flex justify-center pt-6">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </motion.div>

            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Verified</h2>
              <p className="text-gray-600 mb-6">Welcome! Your details are confirmed.</p>

              {found.profile_photo_url && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-6">
                  <img src={found.profile_photo_url} alt={found.name} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-green-500" />
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-gray-900">{found.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-semibold text-gray-900">{found.course || "N/A"}</p>
                  </div>
                </div>

                {found.valid_until && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Valid Until</p>
                      <p className="font-semibold text-gray-900">{new Date(found.valid_until).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-3">
                <Button onClick={handleConfirm} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                  Proceed to Face Verification
                </Button>
              </motion.div>
            </div>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-xl">
          <div className="p-8">
            <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Registration</h1>
              <p className="text-gray-600">Enter your student index number to verify your registration</p>
            </motion.div>

            <div className="space-y-6">
              <div>
                <label htmlFor="indexNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Index Number
                </label>
                <Input
                  id="indexNumber"
                  type="text"
                  placeholder="e.g., STU001234"
                  value={indexNumber}
                  onChange={(e) => {
                    setIndexNumber(e.target.value);
                    setError(null);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleLookup();
                  }}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </motion.div>
              )}

              <div className="space-y-3">
                <Button onClick={handleLookup} disabled={loading || !indexNumber.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  {loading ? "Checking..." : "Verify Registration"}
                </Button>
                <Button onClick={onCancel} variant="outline" className="w-full" disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">Your index number is on your student ID card or registration document</p>
      </div>
    </motion.div>
  );
}
