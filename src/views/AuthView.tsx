import { Shield, Fingerprint, Lock, ArrowRight, HelpCircle, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { AppView } from "@/src/types";
import * as React from "react";

interface AuthViewProps {
  onLogin: (isAdmin?: boolean) => void;
}

export function AuthView({ onLogin }: AuthViewProps) {
  const [showAssistance, setShowAssistance] = React.useState(false);
  const [voterId, setVoterId] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmed = voterId.trim().toUpperCase();
      // Check for admin codes
      if (trimmed.startsWith("ADMIN-") || trimmed === "ELECTION_OFFICER") {
        onLogin(true); // Admin login
      } else if (trimmed) {
        onLogin(false); // Regular voter login
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 sm:p-6">
      <div className="w-full max-w-[440px] space-y-6 sm:space-y-12">
        <div className="text-center space-y-2 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary">Voter Authentication</h1>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-[320px] mx-auto text-center leading-relaxed">
            Please provide your Voter ID to access the National Online Voting System.
          </p>
        </div>

        <Card className="p-6 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-on-surface-variant block">Voter ID or Registered Email</label>
              <Input 
                placeholder="e.g. 1234-5678-90" 
                icon={<Fingerprint size={20} />}
                value={voterId}
                onChange={(e) => setVoterId(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="pt-2">
              <Button 
                className="w-full gap-2 h-12 sm:h-14" 
                size="xl"
                onClick={() => {
                  const trimmed = voterId.trim().toUpperCase();
                  if (trimmed.startsWith("ADMIN-") || trimmed === "ELECTION_OFFICER") {
                    onLogin(true);
                  } else if (voterId.trim()) {
                    onLogin(false);
                  }
                }}
              >
                <span className="hidden sm:inline">Login to Verify Identity</span>
                <span className="sm:hidden">Login</span>
                <ArrowRight className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              </Button>
              <p className="mt-3 sm:mt-4 text-center text-xs text-outline leading-tight">
                By logging in, you agree to the Digital Civic Conduct terms.
              </p>
            </div>
            
            <div className="pt-4 sm:pt-6 border-t border-surface-container flex flex-col items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 sm:gap-2 text-xs sm:text-sm font-bold opacity-70 hover:opacity-100"
                onClick={() => setShowAssistance(true)}
              >
                <HelpCircle className="w-[14px] h-[14px] sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Need Assistance?</span>
                <span className="xs:hidden">Help</span>
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <Lock className="text-secondary fill-secondary/10 shrink-0 w-[18px] h-[18px] sm:w-5 sm:h-5" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-primary">Biometric Ready</p>
              <p className="text-xs text-on-surface-variant leading-tight">2FA and biometric verification required in the next step.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <Shield className="text-secondary fill-secondary/10 shrink-0 w-[18px] h-[18px] sm:w-5 sm:h-5" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-primary">Data Privacy</p>
              <p className="text-xs text-on-surface-variant leading-tight">Your credentials are never stored in plain text.</p>
            </div>
          </div>
        </div>
        

      </div>

      {/* Support Modal */}
      {showAssistance && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <Card className="max-w-md w-full p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface">Voter Support</h2>
              <button 
                onClick={() => setShowAssistance(false)}
                className="text-on-surface hover:text-primary transition-colors"
              >
                <X className="w-[22px] h-[22px] sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-on-surface">Contact Support</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  For assistance with voter ID verification, contact your election authority:
                </p>
                <div className="bg-surface-container-low p-2 sm:p-3 rounded-lg space-y-1">
                  <p className="text-xs sm:text-sm font-mono text-primary">📧 support@civicvote.gov</p>
                  <p className="text-xs sm:text-sm font-mono text-primary">📞 1-800-VOTE-NOW</p>
                  <p className="text-xs sm:text-sm font-mono text-primary">🌐 civicvote.gov/help</p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => setShowAssistance(false)}
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
