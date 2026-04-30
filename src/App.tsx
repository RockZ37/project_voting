/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import { AppView, Candidate, Student } from "./types";
import { Header } from "./components/layout/Header";
import { AuthView } from "./views/AuthView";
import { VerifyIdentityView } from "./views/VerifyIdentityView";
import { VerificationConfirmView } from "./views/VerificationConfirmView";
import { BallotView } from "./views/BallotView";
import { AdminDashboardView } from "./views/AdminDashboardView";
import { AdminRegistryView } from "./views/AdminRegistryView";
import { AdminLogsView } from "./views/AdminLogsView";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { CheckCircle2, Lock, ShieldCheck, Printer, Send, Landmark } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = React.useState<AppView>(AppView.AUTH);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [verifiedStudent, setVerifiedStudent] = React.useState<Student | null>(null);
  const [indexNumber, setIndexNumber] = React.useState<string>("");
  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);

  const handleLogin = (admin: boolean = false, studentId: string = "") => {
    setIsAdmin(admin);
    setIndexNumber(studentId);
    if (admin) {
      // Admins go through facial verification first
      setCurrentView(AppView.VERIFY);
    } else {
      setCurrentView(AppView.VERIFY);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.AUTH:
        return <AuthView onLogin={handleLogin} />;
      case AppView.VERIFY:
        return (
          <VerifyIdentityView 
            indexNumber={indexNumber}
            onVerifyWithStudent={(student) => {
              setVerifiedStudent(student);
              setCurrentView(isAdmin ? AppView.ADMIN_DASHBOARD : AppView.VERIFY_CONFIRM);
            }}
            onCancel={() => setCurrentView(AppView.AUTH)}
            isAdmin={isAdmin}
          />
        );
      case AppView.VERIFY_CONFIRM:
        return verifiedStudent ? (
          <VerificationConfirmView
            student={verifiedStudent}
            onConfirm={() => {
              if (verifiedStudent.status === "Active") {
                setCurrentView(AppView.BALLOT);
              }
            }}
            onCancel={() => {
              setVerifiedStudent(null);
              setCurrentView(AppView.AUTH);
            }}
          />
        ) : null;
      case AppView.BALLOT:
        return (
          <BallotView 
            student={verifiedStudent}
            onSelect={setSelectedCandidate} 
            onReview={() => setCurrentView(AppView.REVIEW)}
            onGoIdentityCheck={() => setCurrentView(AppView.VERIFY_CONFIRM)}
          />
        );
      case AppView.REVIEW:
        return (
          <div className="max-w-2xl mx-auto py-20 px-6 space-y-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
                <Lock size={12} className="fill-current" />
                Step 3 of 4: Final Review
              </div>
              <h1 className="text-4xl font-black tracking-tight">Review Your Ballot</h1>
              <p className="text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Please double-check your selection before finalizing your vote. This action cannot be undone.
              </p>
            </div>

            <Card className="p-10 space-y-10 border-2 border-secondary overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Landmark size={120} />
              </div>
              
              <div className="space-y-2 relative z-10">
                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Your Selection</p>
                <div className="flex items-center gap-6">
                  <img 
                    src={selectedCandidate?.photoUrl} 
                    alt="" 
                    className="w-16 h-16 rounded-lg object-cover border border-outline-variant/30"
                  />
                  <div>
                    <h2 className="text-3xl font-black text-on-surface">{selectedCandidate?.name}</h2>
                    <p className="font-bold text-on-surface-variant">{selectedCandidate?.party}</p>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-surface-container space-y-6 relative z-10">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-secondary shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-bold text-on-surface">Cryptographic Proof Ready</p>
                    <p className="text-xs text-on-surface-variant">A unique verification code will be generated for your audit trail.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="text-secondary shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-bold text-on-surface">End-to-End Encryption</p>
                    <p className="text-xs text-on-surface-variant">Your vote is sealed and anonymized before leaving this device.</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-secondary" />
            </Card>

            <div className="flex flex-col gap-4">
              <Button 
                size="xl" 
                className="h-20 w-full text-lg shadow-xl shadow-secondary/20 hover:shadow-2xl transition-all"
                onClick={() => setCurrentView(AppView.SUCCESS)}
              >
                Seal and Cast My Vote
                <Send size={20} className="ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full font-bold h-14"
                onClick={() => setCurrentView(AppView.BALLOT)}
              >
                Change Selection
              </Button>
            </div>
          </div>
        );
      case AppView.SUCCESS:
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6">
            <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="max-w-xl w-full text-center space-y-10"
            >
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center relative shadow-[0_0_40px_rgba(49,107,243,0.2)]">
                  <CheckCircle2 size={48} className="text-secondary fill-white" />
                  <motion.div 
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-secondary rounded-full"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl font-black tracking-tight text-on-surface">Vote Successfully cast</h1>
                <p className="text-on-surface-variant text-lg leading-relaxed max-w-sm mx-auto">
                  Your voice has been recorded in the National Digital Ballot. Thank you for participating in this democratic process.
                </p>
              </div>

              <Card className="p-8 bg-surface-container-low border-secondary/20">
                <div className="space-y-6">
                   <div>
                     <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2">Receipt / Verification Code</p>
                     <p className="font-mono text-xl font-bold break-all select-all hover:text-secondary transition-colors">
                        CV-2024-88A2-E40B-991Q-91L7
                     </p>
                   </div>
                   <div className="pt-6 border-t border-surface-container flex flex-col md:flex-row gap-4">
                      <Button variant="outline" className="flex-1 gap-2 h-12 font-bold">
                        <Printer size={18} />
                        Print Receipt
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2 h-12 font-bold">
                        <ShieldCheck size={18} />
                        View Blockchain Log
                      </Button>
                   </div>
                </div>
              </Card>

              <div className="pt-6">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="font-bold text-secondary uppercase tracking-widest text-[11px]"
                  onClick={() => {
                    setSelectedCandidate(null);
                    setVerifiedStudent(null);
                    setCurrentView(AppView.AUTH);
                  }}
                >
                  Return to Home
                </Button>
              </div>
            </motion.div>
          </div>
        );
      case AppView.ADMIN_DASHBOARD:
        return <AdminDashboardView />;
      case AppView.ADMIN_REGISTRY:
        return <AdminRegistryView />;
      case AppView.ADMIN_LOGS:
        return <AdminLogsView />;
      default:
        return <AuthView onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary/20 transition-colors duration-500">
      <Header currentView={currentView} setView={setCurrentView} isAdmin={isAdmin} student={verifiedStudent} />
      <main className="pt-16 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 w-full h-8 bg-white/50 backdrop-blur-sm border-t border-outline-variant/30 hidden md:flex items-center px-6">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-outline">
          <div className="flex gap-4">
            <span>© 2026 CivicVote National Commission</span>
              <span>Version 1.0.0</span>
          </div>
          <div className="flex items-center gap-1.5 text-secondary">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             Secure Node Connection: Active
          </div>
        </div>
      </footer>
    </div>
  );
}

