import { useEffect, useState } from "react";
import { Login } from "@/components/Login";
import { AppShell } from "@/components/shell/AppShell";
import type { ShellView } from "@/components/shell/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { ProfileHistory } from "@/components/ProfileHistory";
import { UsersPage } from "@/components/UsersPage";
import { SettingsPage } from "@/components/SettingsPage";
import { Intake } from "@/components/Intake";
import { Assessment } from "@/components/Assessment";
import { Generating } from "@/components/Generating";
import { Results } from "@/components/Results";
import { getUser, logout, ensureSeedAccounts, type User } from "@/lib/auth";
import {
  getProfiles,
  saveProfile,
  getProfileById,
  type SavedProfile,
} from "@/lib/storage";
import { generateProfile, type Participant, type ProfileResult } from "@/lib/gemini";
import type { Answer } from "@/data/questions";
import { generateId } from "@/lib/utils";

type Stage =
  | "shell"
  | "intake"
  | "assessment"
  | "generating"
  | "results-fresh"
  | "results-view"
  | "results-dummy";

export default function App() {
  const [user, setUser] = useState<User | null>(getUser);
  const [shellView, setShellView] = useState<ShellView>("dashboard");
  const [stage, setStage] = useState<Stage>("shell");
  const [profiles, setProfiles] = useState<SavedProfile[]>(getProfiles);

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [lastAnswers, setLastAnswers] = useState<Answer[]>([]);
  const [freshEntry, setFreshEntry] = useState<SavedProfile | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [dummyView, setDummyView] = useState<{
    profile: ProfileResult;
    participant: Participant;
    createdAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    ensureSeedAccounts();
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
    setStage("shell");
    setShellView("dashboard");
  }

  function startNewAssessment() {
    setStage("intake");
  }

  function handleIntakeSubmit(p: Participant) {
    setParticipant(p);
    setStage("assessment");
  }

  async function runAssessment(answers: Answer[]) {
    if (!participant || !user) return;
    setLastAnswers(answers);
    setStage("generating");
    setError(null);
    setStatus(null);
    try {
      const result = await generateProfile(participant, answers, {
        onRetry: ({ attempt }) =>
          setStatus(
            `AI সার্ভারে চাপ বেশি — আবার চেষ্টা করা হচ্ছে (${attempt})...`,
          ),
      });
      const entry: SavedProfile = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        createdBy: user.email,
        participant,
        answers,
        profile: result,
      };
      saveProfile(entry);
      setProfiles(getProfiles());
      setFreshEntry(entry);
      setStage("results-fresh");
    } catch (e) {
      setError(e instanceof Error ? e.message : "অজানা একটি সমস্যা হয়েছে।");
    } finally {
      setStatus(null);
    }
  }

  function openProfile(id: string) {
    setViewingId(id);
    setStage("results-view");
  }

  function viewDummyProfile(data: {
    profile: ProfileResult;
    participant: Participant;
    createdAt: string;
  }) {
    setDummyView(data);
    setStage("results-dummy");
  }

  function backToShell(view: ShellView) {
    setStage("shell");
    setShellView(view);
    setParticipant(null);
    setFreshEntry(null);
    setViewingId(null);
    setDummyView(null);
  }

  if (!user) return <Login onLogin={setUser} />;

  /** সাধারণ ইউজার শুধু নিজের নেওয়া অ্যাসেসমেন্ট দেখতে পারবে — অ্যাডমিন ও ফিল্ড অফিসার সবগুলো দেখে */
  const visibleProfiles =
    user.role === "user"
      ? profiles.filter((p) => p.createdBy === user.email)
      : profiles;

  if (stage === "intake")
    return (
      <Intake
        role={user.role}
        onSubmit={handleIntakeSubmit}
        onCancel={() => backToShell("dashboard")}
      />
    );

  if (stage === "assessment") return <Assessment onComplete={runAssessment} />;

  if (stage === "generating")
    return (
      <Generating
        error={error}
        status={status}
        onRetry={() => runAssessment(lastAnswers)}
        onBack={() => setStage("assessment")}
      />
    );

  if (stage === "results-fresh" && freshEntry)
    return (
      <Results
        profile={freshEntry.profile}
        participant={freshEntry.participant}
        createdAt={freshEntry.createdAt}
        mode="fresh"
        onBack={() => backToShell("dashboard")}
      />
    );

  if (stage === "results-view" && viewingId) {
    const entry = getProfileById(viewingId);
    if (entry && (user.role !== "user" || entry.createdBy === user.email))
      return (
        <Results
          profile={entry.profile}
          participant={entry.participant}
          createdAt={entry.createdAt}
          mode="view"
          onBack={() => backToShell("history")}
        />
      );
  }

  if (stage === "results-dummy" && dummyView)
    return (
      <Results
        profile={dummyView.profile}
        participant={dummyView.participant}
        createdAt={dummyView.createdAt}
        mode="fresh"
        onBack={() => backToShell("dashboard")}
      />
    );

  return (
    <AppShell
      user={user}
      active={shellView}
      onNavigate={setShellView}
      onLogout={handleLogout}
    >
      {shellView === "dashboard" &&
        (user.role === "admin" ? (
          <AdminDashboard user={user} onViewParticipant={viewDummyProfile} />
        ) : (
          <Dashboard
            user={user}
            profiles={visibleProfiles}
            onNewAssessment={startNewAssessment}
            onOpenProfile={openProfile}
            onSeeAll={() => setShellView("history")}
          />
        ))}
      {shellView === "history" && (
        <ProfileHistory profiles={visibleProfiles} onOpenProfile={openProfile} />
      )}
      {shellView === "users" && user.role === "admin" && (
        <UsersPage currentUserEmail={user.email} />
      )}
      {shellView === "settings" && user.role === "admin" && <SettingsPage />}
    </AppShell>
  );
}
