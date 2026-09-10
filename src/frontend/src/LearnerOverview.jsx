import { useEffect, useState } from "react";
import { ArrowUpRight, Target, BookOpenCheck, Sparkles } from "lucide-react";
import { api } from "./api";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({ icon: Icon, label, value, sub, tint }) {
  return (
    <div className="bg-white border border-border rounded-lg p-5 hover:border-navy-700 hover:shadow-sm transition-all">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${tint}`}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <p className="text-xs text-ink-500">{label}</p>
      </div>
      <p className="text-3xl font-heading font-bold text-navy-950">{value}</p>
      {sub && <p className="text-xs text-ink-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function LearnerOverview({ official, onGoToLearning }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getStats(official.id)
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-danger-600 bg-danger-100 px-4 py-3 rounded-md">{error}</p>;
  }
  if (!stats) {
    return <p className="text-ink-500 text-sm">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-navy-950">
          {greeting()}, {official.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Here's where your learning plan stands today.
        </p>
      </div>

      <div className="bg-navy-950 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-md">
          <p className="text-xs uppercase tracking-wide text-gold-500 font-medium mb-3">
            Your Readiness
          </p>
          <h2 className="text-2xl font-heading font-bold mb-3 leading-snug">
            Build the skills your role needs.
          </h2>
          <p className="text-sm text-navy-100/80 mb-5">
            {stats.domains_gap > 0
              ? `${stats.domains_gap} of ${stats.total_domains} competency areas need attention — your recommended courses are ready.`
              : "You're meeting the benchmark across every tracked domain."}
          </p>
          <button
            onClick={onGoToLearning}
            className="inline-flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-navy-950 text-sm font-medium rounded-md px-4 py-2.5 transition-colors"
          >
            Continue learning <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-gold-500/30 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-heading font-bold text-gold-500">{stats.readiness_score}</p>
            <p className="text-[10px] text-navy-100/70 uppercase tracking-wide">Readiness</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Target}
          label="Role Readiness"
          value={`${stats.readiness_score}/100`}
          sub="Average across all domains"
          tint="bg-navy-100 text-navy-900"
        />
        <StatCard
          icon={BookOpenCheck}
          label="Domains On Track"
          value={`${stats.domains_ready}/${stats.total_domains}`}
          sub={`${stats.domains_gap} still need focus`}
          tint="bg-teal-100 text-teal-700"
        />
        <StatCard
          icon={Sparkles}
          label="Quizzes Completed"
          value={stats.quizzes_taken}
          sub="Self-assessments taken"
          tint="bg-gold-100 text-gold-600"
        />
      </div>

      <section className="bg-white border border-border rounded-lg p-6">
        <h2 className="text-sm font-heading font-bold text-navy-950 mb-4">Recent Activity</h2>
        {stats.recent_attempts.length === 0 ? (
          <p className="text-sm text-ink-500">
            No quiz activity yet — head to My Learning to take an available quiz.
          </p>
        ) : (
          <div className="space-y-2">
            {stats.recent_attempts.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm border-b border-border last:border-0 py-2"
              >
                <span className="text-ink-900">{a.domain} quiz</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-ink-500">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      a.score_percent >= 70
                        ? "bg-teal-100 text-teal-700"
                        : "bg-gold-100 text-gold-600"
                    }`}
                  >
                    {a.score_percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
