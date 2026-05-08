import * as React from "react";
import { AppView, Candidate, Student, Election, NotificationItem, SessionUser, AuditLog, Voter } from "./types";
import { Header } from "./components/layout/Header";
import { AuthView } from "./views/AuthView";
import { RegistryLookupView } from "./views/RegistryLookupView";
import { VerifyIdentityView } from "./views/VerifyIdentityView";
import { VerificationConfirmView } from "./views/VerificationConfirmView";
import { ElectionsView } from "./views/ElectionsView";
import { ElectionDetailView } from "./views/ElectionDetailView";
import { BallotView } from "./views/BallotView";
import { AdminDashboardView } from "./views/AdminDashboardView";
import { AdminRegistryView } from "./views/AdminRegistryView";
import { AdminLogsView } from "./views/AdminLogsView";
import AdminCreateElectionView from "./views/AdminCreateElectionView";
import AdminCreateCandidateView from "./views/AdminCreateCandidateView";
import AdminPageLayout from "./components/layout/AdminPageLayout";
import { BallotPageLayout } from "./components/layout/BallotPageLayout";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { CheckCircle2, Lock, ShieldCheck, Send, Landmark } from "lucide-react";
import { api } from "./lib/api";

export default function App() {
  const [currentView, setCurrentView] = React.useState<AppView>(AppView.AUTH);
  const [sessionUser, setSessionUser] = React.useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [verifiedStudent, setVerifiedStudent] = React.useState<Student | null>(null);
  const [faceEmbedding, setFaceEmbedding] = React.useState<number[] | null>(null);
  const [enrollMode, setEnrollMode] = React.useState(false);
  const [indexNumber, setIndexNumber] = React.useState<string>("");
  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);
  const [currentElection, setCurrentElection] = React.useState<Election | null>(null);
  const [elections, setElections] = React.useState<Election[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [voters, setVoters] = React.useState<Voter[]>([]);
  const [receiptCode, setReceiptCode] = React.useState<string>("");
  const [votedElectionIds, setVotedElectionIds] = React.useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const notificationTimersRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const hasVotedForCurrentElection = currentElection ? Boolean(votedElectionIds[currentElection.id]) : false;
  const liveVoteCount = React.useMemo(() => elections.reduce((acc, election) => acc + election.voteCount, 0), [elections]);

  const addNotification = React.useCallback((notification: Omit<NotificationItem, "id" | "createdAt" | "read">) => {
    const createdAt = new Date().toISOString();
    const id = crypto.randomUUID();
    setNotifications((current) => [{ id, createdAt, read: false, ...notification }, ...current]);

    notificationTimersRef.current[id] = setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id));
      delete notificationTimersRef.current[id];
    }, 12000);
  }, []);

  React.useEffect(() => {
    return () => {
      Object.values(notificationTimersRef.current).forEach((timerId) => clearTimeout(timerId));
    };
  }, []);

  const markNotificationsRead = React.useCallback(() => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  }, []);

  const loadElections = React.useCallback(async () => {
    try {
      const data = await api.getElections();
      setElections(data);
      if (currentElection) {
        const refreshed = data.find((e) => e.id === currentElection.id) || null;
        setCurrentElection(refreshed);
      }
    } catch (error: any) {
      addNotification({ title: "Failed to load elections", message: error.message || "Could not reach backend.", tone: "warning" });
    }
  }, [addNotification, currentElection]);

  const loadAdminData = React.useCallback(async () => {
    try {
      const [registry, logs] = await Promise.all([api.getVoters(), api.getAuditLogs()]);
      setVoters(registry);
      setAuditLogs(logs);
    } catch {
      // Non-admin sessions can fail here; keep silent in voter mode.
    }
  }, []);

  React.useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await api.me();
        if (me.user) {
          setSessionUser(me.user);
          const admin = me.user.role === "admin";
          setIsAdmin(admin);
          if (admin) {
            setCurrentView(AppView.ADMIN_DASHBOARD);
            await loadAdminData();
          }
        }
      } catch {
        setSessionUser(null);
      }
      await loadElections();
    };

    void bootstrap();
  }, [loadAdminData, loadElections]);

  const handleLogin = async (payload: { email: string; isAdmin: boolean; indexNumber?: string }) => {
    try {
      const user = await api.login(payload.email, payload.indexNumber, payload.isAdmin);
      setSessionUser(user);
      const isAdminUser = user.role === "admin";
      setIsAdmin(isAdminUser);
      setIndexNumber(payload.indexNumber || "");
      setFaceEmbedding(null);
      if (payload.isAdmin && !isAdminUser) {
        addNotification({
          title: "Admin Access Denied",
          message: "This account is not an admin account. You were signed in as a voter.",
          tone: "warning",
        });
      }
      addNotification({
        title: "Session Started",
        message: isAdminUser ? "Administrator login verified." : "Voter login verified.",
        tone: "success",
      });
      // Admins skip registry lookup and go to admin dashboard
      setCurrentView(isAdminUser ? AppView.ADMIN_DASHBOARD : AppView.REGISTRY_LOOKUP);
    } catch (error: any) {
      addNotification({ title: "Login Failed", message: error.message || "Invalid credentials", tone: "warning" });
    }
  };

  const handleRegistryLookupComplete = async (index: string) => {
    setIndexNumber(index);
    try {
      const resolvedStudent = await api.getStudentByIndex(index);
      if (!resolvedStudent) {
        addNotification({ title: "Registry Lookup Failed", message: "Could not load the verified student record.", tone: "warning" });
        setCurrentView(AppView.AUTH);
        return;
      }
      setVerifiedStudent(resolvedStudent);
      setCurrentView(AppView.VERIFY);
    } catch (error: any) {
      addNotification({ title: "Registry Lookup Failed", message: error.message || "Could not load the verified student record.", tone: "warning" });
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      setSessionUser(null);
      setVerifiedStudent(null);
      setFaceEmbedding(null);
      setIsAdmin(false);
      setCurrentView(AppView.AUTH);
    }
  };

  const handleVerificationComplete = async (embedding: number[]) => {
    // enrollment flow: if enrollMode is active, send embedding to enroll endpoint
    if (enrollMode) {
      try {
        await api.enroll(embedding);
        addNotification({ title: "Enrollment Saved", message: "Your face has been enrolled.", tone: "success" });
        setEnrollMode(false);
        const resolvedStudent = verifiedStudent || (indexNumber ? await api.getStudentByIndex(indexNumber) : null);
        setVerifiedStudent(resolvedStudent);
        setCurrentView(AppView.VERIFY_CONFIRM);
        return;
      } catch (err: any) {
        addNotification({ title: "Enrollment Failed", message: err.message || "Could not enroll face.", tone: "warning" });
        setEnrollMode(false);
        setCurrentView(AppView.VERIFY_CONFIRM);
        return;
      }
    }

    setFaceEmbedding(embedding);

    if (isAdmin) {
      await loadAdminData();
      setCurrentView(AppView.ADMIN_DASHBOARD);
      return;
    }

    try {
      const resolvedStudent = verifiedStudent || (indexNumber ? await api.getStudentByIndex(indexNumber) : null);
      if (!resolvedStudent) {
        addNotification({ title: "Student Not Found", message: "No student profile matched this session.", tone: "warning" });
        setCurrentView(AppView.AUTH);
        return;
      }
      setVerifiedStudent(resolvedStudent);
      addNotification({ title: "Identity Verified", message: `${resolvedStudent.name} matched successfully.`, tone: "success" });
      setCurrentView(AppView.VERIFY_CONFIRM);
    } catch (error: any) {
      addNotification({ title: "Verification Error", message: error.message || "Could not fetch verified profile.", tone: "warning" });
    }
  };

  const createElection = React.useCallback(async (election: Election) => {
    try {
      const created = await api.createElection(election);
      setElections((curr) => [created, ...curr]);
      setCurrentElection(created);
      addNotification({ title: "Election Created", message: `${created.title} has been created.`, tone: "success" });
      await loadElections();
      await loadAdminData();
    } catch (error: any) {
      addNotification({ title: "Create Failed", message: error.message || "Could not create election.", tone: "warning" });
    }
  }, [addNotification, loadAdminData]);

  const addCandidate = React.useCallback(async (electionId: string, candidate: Candidate) => {
    try {
      const created = await api.addCandidate(electionId, candidate);
      const refreshedElections = await api.getElections();
      const refreshedTargetElection = refreshedElections.find((e) => e.id === electionId) || null;

      setElections(refreshedElections);
      setCurrentElection(refreshedTargetElection || refreshedElections[0] || null);
      addNotification({ title: "Candidate Added", message: `${created.name} has been added to the election.`, tone: "success" });
      await loadAdminData();
    } catch (error: any) {
      addNotification({ title: "Create Failed", message: error.message || "Could not add candidate.", tone: "warning" });
    }
  }, [addNotification, loadAdminData]);

  const handleCastVote = React.useCallback(async () => {
    if (!currentElection || !selectedCandidate || !sessionUser) return;

    if (!faceEmbedding) {
      addNotification({ title: "Verification Required", message: "Complete the face scan before voting.", tone: "warning" });
      return;
    }

    if (currentElection.status === "Closed") {
      addNotification({ title: "Election Closed", message: `Voting for ${currentElection.title} has ended.`, tone: "warning" });
      return;
    }

    if (votedElectionIds[currentElection.id]) {
      addNotification({ title: "Vote Already Cast", message: `You already voted in ${currentElection.title}.`, tone: "warning" });
      return;
    }

    try {
      const verification = await api.startVerification(currentElection.id, "face");
      const completed = await api.completeVerification(verification.id, { embedding: faceEmbedding });

      if (completed.status !== "verified") {
        addNotification({
          title: "Verification Failed",
          message: completed.notes || `Face match score ${Number(completed.score || 0).toFixed(2)} did not meet the threshold.`,
          tone: "warning",
        });
        return;
      }

      const voterCandidates = await api.getVoters(sessionUser.email);
      const matchedVoter = voterCandidates.find((voter) => voter.email === sessionUser.email);
      const vote = await api.castVote({
        electionId: currentElection.id,
        candidateId: selectedCandidate.id,
        verificationSessionId: verification.id,
        voterId: matchedVoter?.id,
      });

      setReceiptCode(vote.receipt_code);
      setVotedElectionIds((current) => ({ ...current, [currentElection.id]: true }));
      await loadElections();

      addNotification({ title: "Vote Cast Successfully", message: `${selectedCandidate.name} submitted for ${currentElection.title}.`, tone: "success" });
      setCurrentView(AppView.SUCCESS);
    } catch (error: any) {
      addNotification({ title: "Vote Failed", message: error.message || "Could not cast vote.", tone: "warning" });
    }
  }, [addNotification, currentElection, faceEmbedding, loadElections, selectedCandidate, sessionUser, votedElectionIds]);

  const renderView = () => {
    switch (currentView) {
      case AppView.AUTH:
        return <AuthView onLogin={handleLogin} />;

      case AppView.REGISTRY_LOOKUP:
        return <RegistryLookupView onLookupComplete={(index) => void handleRegistryLookupComplete(index)} onCancel={() => setCurrentView(AppView.AUTH)} />;

      case AppView.VERIFY:
        return <VerifyIdentityView onVerify={handleVerificationComplete} onCancel={() => setCurrentView(AppView.AUTH)} isAdmin={isAdmin} />;

      case AppView.VERIFY_CONFIRM:
        return verifiedStudent ? (
          <VerificationConfirmView
            student={verifiedStudent}
            onConfirm={() => {
              if (verifiedStudent.status === "Active") {
                setCurrentView(AppView.ELECTIONS);
              }
            }}
            onCancel={() => {
              setVerifiedStudent(null);
              setCurrentView(AppView.AUTH);
            }}
            onEnroll={() => {
              setEnrollMode(true);
              setCurrentView(AppView.VERIFY);
            }}
          />
        ) : null;

      case AppView.ELECTIONS:
        return (
          <BallotPageLayout voteCount={liveVoteCount} onViewResults={() => setCurrentView(AppView.RESULTS)}>
            <ElectionsView
              elections={elections}
              onSelectElection={(election) => {
                setCurrentElection(election);
                addNotification({ title: "Election Selected", message: `You selected ${election.title}.`, tone: "info" });
              }}
              onViewChange={setCurrentView}
            />
          </BallotPageLayout>
        );

      case AppView.ELECTION_DETAIL:
        return currentElection ? (
          <ElectionDetailView
            election={currentElection}
            student={verifiedStudent}
            hasVoted={hasVotedForCurrentElection}
            onSelect={(candidate) => {
              setSelectedCandidate(candidate);
              addNotification({ title: "Candidate Selected", message: `${candidate.name} ready for review.`, tone: "info" });
              setCurrentView(AppView.REVIEW);
            }}
            onBack={() => setCurrentView(AppView.ELECTIONS)}
            onViewResults={() => setCurrentView(AppView.RESULTS)}
          />
        ) : null;

      case AppView.BALLOT:
        return (
          <BallotView
            student={verifiedStudent}
            voteCount={liveVoteCount}
            currentElection={currentElection}
            onViewResults={() => setCurrentView(AppView.RESULTS)}
            onSelect={(candidate) => {
              setSelectedCandidate(candidate);
              setCurrentView(AppView.REVIEW);
            }}
          />
        );

      case AppView.REVIEW:
        return (
          <BallotPageLayout voteCount={currentElection?.voteCount || liveVoteCount} currentElection={currentElection} onViewElections={() => setCurrentView(AppView.ELECTIONS)} onViewResults={() => setCurrentView(AppView.RESULTS)}>
            <div className="max-w-2xl mx-auto py-20 px-6 space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
                  <Lock size={12} className="fill-current" />
                  Step 3 of 4: Final Review
                </div>
                <h1 className="text-4xl font-black tracking-tight">Review Your Ballot</h1>
              </div>

              <Card className="p-10 space-y-10 border-2 border-secondary overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Landmark size={120} /></div>
                <div className="space-y-4 relative z-10">
                  <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Your Selection</p>
                  <div className="flex items-center gap-6">
                    <img src={selectedCandidate?.photoUrl} alt="" className="w-16 h-16 rounded-lg object-cover border border-outline-variant/30" />
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
                </div>
              </Card>

              <div className="flex flex-col gap-4">
                <Button size="xl" className="h-20 w-full text-lg" onClick={handleCastVote} disabled={hasVotedForCurrentElection || !selectedCandidate}>
                  {hasVotedForCurrentElection ? "Vote Already Cast" : "Seal and Cast My Vote"}
                  <Send size={20} className="ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="w-full font-bold h-14" onClick={() => setCurrentView(AppView.ELECTION_DETAIL)}>
                  Change Selection
                </Button>
              </div>
            </div>
          </BallotPageLayout>
        );

      case AppView.SUCCESS:
        return (
          <BallotPageLayout voteCount={currentElection?.voteCount || liveVoteCount} currentElection={currentElection} selectedCandidateName={selectedCandidate?.name} showResults={false} onViewElections={() => { setSelectedCandidate(null); setCurrentView(AppView.ELECTIONS); }} onViewResults={() => setCurrentView(AppView.RESULTS)}>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl w-full text-center space-y-10">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center relative shadow-[0_0_40px_rgba(49,107,243,0.2)]">
                    <CheckCircle2 size={48} className="text-secondary fill-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h1 className="text-5xl font-black tracking-tight text-on-surface">Vote Successfully cast</h1>
                  <p className="text-on-surface-variant text-lg leading-relaxed max-w-sm mx-auto">Your ballot has been securely recorded.</p>
                </div>

                <Card className="p-8 bg-surface-container-low border-secondary/20">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2">Receipt / Verification Code</p>
                  <p className="font-mono text-xl font-bold break-all select-all hover:text-secondary transition-colors">{receiptCode || "Unavailable"}</p>
                </Card>

                <Button size="lg" className="w-full font-bold h-14" onClick={() => setCurrentView(AppView.ELECTION_DETAIL)}>
                  Back to Ballot Page
                </Button>
              </motion.div>
            </div>
          </BallotPageLayout>
        );

      case AppView.RESULTS:
        return currentElection ? (
          <BallotPageLayout voteCount={currentElection.voteCount} currentElection={currentElection} selectedCandidateName={selectedCandidate?.name} showResults onViewElections={() => setCurrentView(AppView.ELECTIONS)} onViewResults={() => setCurrentView(AppView.RESULTS)}>
            <div className="max-w-3xl mx-auto py-16 px-6 space-y-8">
              <header className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Election Results</p>
                <h1 className="text-4xl font-black tracking-tight text-on-surface">{currentElection.title}</h1>
              </header>

              <Card className="p-8 sm:p-10 border-2 border-secondary/20 bg-surface-container-low space-y-6">
                <div className="space-y-3 pt-2">
                  {currentElection.candidates.map((candidate) => {
                    const votes = candidate.voteCount || 0;
                    const totalVotes = Math.max(1, currentElection.voteCount || 1);
                    const percent = Math.round((votes / totalVotes) * 100);
                    return (
                      <div key={candidate.id} className="rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start border-outline-variant/30 bg-white/60">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-outline-variant/30 shrink-0 bg-white">
                          <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="text-lg font-bold text-on-surface">{candidate.name}</h3>
                          <p className="text-sm font-semibold text-on-surface-variant">{candidate.party}</p>
                        </div>
                        <div className="sm:w-36 flex-shrink-0 flex flex-col items-end gap-1">
                          <div className="text-sm font-bold text-on-surface">{votes.toLocaleString()}</div>
                          <div className="text-xs text-on-surface-variant">{percent}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1" onClick={() => setCurrentView(AppView.ELECTION_DETAIL)}>Back to Ballot Page</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setCurrentView(AppView.ELECTIONS)}>Back to Elections</Button>
                </div>
              </Card>
            </div>
          </BallotPageLayout>
        ) : null;

      case AppView.ADMIN_DASHBOARD:
        return (
          <AdminPageLayout currentView={currentView} onNavigate={(v) => setCurrentView(v)} onCreateElection={() => setCurrentView(AppView.ADMIN_CREATE)} onCreateCandidate={() => setCurrentView(AppView.ADMIN_CREATE_CANDIDATE)} currentElection={currentElection} elections={elections}>
            <AdminDashboardView currentElection={currentElection} onCreateElection={createElection} onAddCandidate={addCandidate} elections={elections} auditLogs={auditLogs} voterCount={voters.length} />
          </AdminPageLayout>
        );

      case AppView.ADMIN_REGISTRY:
        return (
          <AdminPageLayout currentView={currentView} onNavigate={(v) => setCurrentView(v)} onCreateElection={() => setCurrentView(AppView.ADMIN_CREATE)} onCreateCandidate={() => setCurrentView(AppView.ADMIN_CREATE_CANDIDATE)} currentElection={currentElection} elections={elections}>
            <AdminRegistryView />
          </AdminPageLayout>
        );

      case AppView.ADMIN_LOGS:
        return (
          <AdminPageLayout currentView={currentView} onNavigate={(v) => setCurrentView(v)} onCreateElection={() => setCurrentView(AppView.ADMIN_CREATE)} onCreateCandidate={() => setCurrentView(AppView.ADMIN_CREATE_CANDIDATE)} currentElection={currentElection} elections={elections}>
            <AdminLogsView logs={auditLogs} />
          </AdminPageLayout>
        );

      case AppView.ADMIN_CREATE:
        return (
          <AdminPageLayout currentView={currentView} onNavigate={(v) => setCurrentView(v)} onCreateElection={() => setCurrentView(AppView.ADMIN_CREATE)} onCreateCandidate={() => setCurrentView(AppView.ADMIN_CREATE_CANDIDATE)} currentElection={currentElection} elections={elections}>
            <AdminCreateElectionView
              onCreate={(election) => {
                void createElection(election);
                setCurrentView(AppView.ADMIN_DASHBOARD);
              }}
              onCancel={() => setCurrentView(AppView.ADMIN_DASHBOARD)}
            />
          </AdminPageLayout>
        );

      case AppView.ADMIN_CREATE_CANDIDATE:
        return (
          <AdminPageLayout currentView={currentView} onNavigate={(v) => setCurrentView(v)} onCreateElection={() => setCurrentView(AppView.ADMIN_CREATE)} onCreateCandidate={() => setCurrentView(AppView.ADMIN_CREATE_CANDIDATE)} currentElection={currentElection} elections={elections}>
            <AdminCreateCandidateView
              elections={elections}
              onCreateCandidate={(electionId, candidate) => {
                void addCandidate(electionId, candidate);
                setCurrentView(AppView.ADMIN_DASHBOARD);
              }}
              onCancel={() => setCurrentView(AppView.ADMIN_DASHBOARD)}
            />
          </AdminPageLayout>
        );

      default:
        return <AuthView onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary/20 transition-colors duration-500">
      <Header currentView={currentView} setView={setCurrentView} isAdmin={isAdmin} student={verifiedStudent} notifications={notifications} onNotificationsToggle={markNotificationsRead} onLogout={() => { void handleLogout(); }} />
      <main className="pt-16 pb-20">
        <AnimatePresence mode="wait">
          <motion.div key={currentView} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}>
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
