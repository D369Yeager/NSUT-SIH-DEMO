import { useEffect, useState } from "react";
import { LayoutGrid, BookOpen, Target, UploadCloud, BarChart3 } from "lucide-react";
import Login from "./Login";
import Sidebar from "./Sidebar";
import LearnerOverview from "./LearnerOverview";
import LearnerMyLearning from "./LearnerMyLearning";
import LearnerSkillProfile from "./LearnerSkillProfile";
import AdminContent from "./AdminContent";
import AdminInsights from "./AdminInsights";
import { api } from "./api";

const LEARNER_NAV = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "learning", label: "My Learning", icon: BookOpen },
  { key: "profile", label: "Skill Profile", icon: Target },
];

const ADMIN_NAV = [
  { key: "content", label: "Content & Quizzes", icon: UploadCloud },
  { key: "insights", label: "Insights", icon: BarChart3 },
];

export default function App() {
  const [official, setOfficial] = useState(null);
  const [page, setPage] = useState(null);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    if (!official) return;
    const navItems = official.role === "admin" ? ADMIN_NAV : LEARNER_NAV;
    setPage(navItems[0].key);
  }, [official]);

  useEffect(() => {
    const check = () => api.health().then(() => setBackendOnline(true)).catch(() => setBackendOnline(false));
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("token");
    setOfficial(null);
    setPage(null);
  }

  if (!official) {
    return <Login onLogin={setOfficial} />;
  }

  const navItems = official.role === "admin" ? ADMIN_NAV : LEARNER_NAV;

  function renderPage() {
    if (official.role === "admin") {
      if (page === "content") return <AdminContent />;
      if (page === "insights") return <AdminInsights />;
    } else {
      if (page === "overview")
        return <LearnerOverview official={official} onGoToLearning={() => setPage("learning")} />;
      if (page === "learning") return <LearnerMyLearning official={official} />;
      if (page === "profile") return <LearnerSkillProfile official={official} />;
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar
        navItems={navItems}
        activePage={page}
        onSelect={setPage}
        official={official}
        onLogout={handleLogout}
        backendOnline={backendOnline}
      />
      <main className="flex-1 px-8 py-8 max-w-5xl mx-auto w-full">{renderPage()}</main>
    </div>
  );
}
