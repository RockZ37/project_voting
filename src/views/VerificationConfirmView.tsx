import * as React from "react";
import { motion } from "motion/react";
import { ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, ShieldX } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Student } from "@/src/types";

interface VerificationConfirmViewProps {
  student: Student;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VerificationConfirmView({ student, onConfirm, onCancel }: VerificationConfirmViewProps) {
  const isEligible = student.status === "Active";

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-6 sm:space-y-8"
      >
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={isEligible ? "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center" : "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"}
            >
              {isEligible ? (
                <CheckCircle2 size={32} className="text-green-600 fill-green-50" />
              ) : (
                <ShieldX size={32} className="text-red-600" />
              )}
            </motion.div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-on-surface">
              {isEligible ? "Identity Verified" : "Verification Blocked"}
            </h1>
            <p className="text-on-surface-variant text-base max-w-sm mx-auto leading-relaxed">
              {isEligible
                ? "Your biometric data has been matched with your HTU record. Please confirm the details below before proceeding to vote."
                : "You are not a student of HTU. Access to ballot has been blocked."}
            </p>
          </div>
        </div>

        {/* Student Record Card */}
        <Card className="p-5 sm:p-8 space-y-6 border-2 border-green-200 bg-white">
          {/* Student Photo and Name */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-2 border-outline-variant/30 shrink-0 shadow-md mx-auto sm:mx-0">
              <img
                src={student.photoUrl}
                alt={student.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-4 my-auto text-center sm:text-left">
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">
                  Student Name
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-on-surface">{student.name}</h2>
              </div>
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">
                  HTU Index Number
                </p>
                <p className="font-mono text-lg font-bold text-primary">{student.id}</p>
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div className="pt-6 border-t border-outline-variant/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">
                Department
              </p>
              <p className="font-semibold text-on-surface">{student.department}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">
                Status
              </p>
              <p className={student.status === "Active" ? "font-semibold text-green-700" : "font-semibold text-red-700"}>{student.status}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">
                Email
              </p>
              <p className="font-semibold text-on-surface">{student.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">
                Registered Since
              </p>
              <p className="font-semibold text-on-surface">{student.registrationDate}</p>
            </div>
          </div>

          {/* Verification Status */}
          <div className={isEligible ? "pt-6 border-t border-outline-variant/30 flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200" : "pt-6 border-t border-outline-variant/30 flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200"}>
            {isEligible ? (
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 fill-green-50" />
            ) : (
              <ShieldX className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <div className="flex-1">
              <p className={isEligible ? "text-sm font-bold text-green-900" : "text-sm font-bold text-red-900"}>
                {isEligible ? "Biometric Verification Successful" : "Verification Rejected"}
              </p>
              <p className={isEligible ? "text-xs text-green-800 leading-tight" : "text-xs text-red-800 leading-tight"}>
                {isEligible
                  ? "Your face has been verified against the HTU database."
                  : "You are not a student of HTU. You cannot continue to the ballot."}
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            size="xl"
            className="h-14 sm:h-16 w-full text-base sm:text-lg font-bold gap-2"
            disabled={!isEligible}
            onClick={onConfirm}
          >
            {isEligible ? "Proceed to Ballot" : "Ballot Access Blocked"}
            <ArrowRight size={20} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full font-bold h-12"
            onClick={onCancel}
          >
            Cancel and Return
          </Button>
        </div>

        {/* Info Alert */}
        <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900 leading-relaxed">
            By proceeding, you confirm that the information displayed is accurate. Your HTU index number and verified face will be used to record your vote securely.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
