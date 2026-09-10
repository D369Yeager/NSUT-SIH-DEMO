import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { api } from "./api";

function GapRow({ domain, current, target, gap }) {
  const isReady = gap === 0;
  const barColor = gap > 30 ? "bg-danger-600" : gap > 10 ? "bg-gold-500" : "bg-teal-700";

  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3 min-w-[220px]">
        <div className="w-8 h-8 rounded-md bg-navy-100 text-navy-900 flex items-center justify-center shrink-0">
          <Target size={15} />
        </div>
        <div>
          <p className="text-sm font-medium text-ink-900">{domain}</p>
          <p className="text-xs text-ink-500">Target · {target}%</p>
        </div>
      </div>

      <div className="flex-1 mx-6 h-2 rounded-full bg-navy-100 overflow-hidden hidden sm:block">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${Math.min(100, current)}%` }}
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-ink-900 w-10 text-right">{current}%</span>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            isReady ? "bg-teal-100 text-teal-700" : "bg-danger-100 text-danger-600"
          }`}
        >
          {isReady ? "Ready" : "Gap"}
        </span>
      </div>
    </div>
  );
}

export default function LearnerSkillProfile({ official }) {
  const [profile, setProfile] = useState(null);
  const [gaps, setGaps] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getProfile(official.id), api.getGapAnalysis(official.id)])
      .then(([profileData, gapData]) => {
        setProfile(profileData);
        setGaps(gapData.gaps);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-danger-600 bg-danger-100 px-4 py-3 rounded-md">{error}</p>;
  }
  if (!profile || !gaps) {
    return <p className="text-ink-500 text-sm">Loading your skill profile...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-navy-950">Skill Profile</h1>
        <p className="text-sm text-ink-500 mt-1">
          A live view of your competencies, measured against your role's benchmark.
        </p>
      </div>

      <div className="bg-white border border-border rounded-lg p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-lg font-heading font-bold text-navy-950">{profile.name}</p>
          <p className="text-sm text-ink-500">
            {profile.designation} · {profile.department}
          </p>
        </div>
      </div>

      <section className="bg-white border border-border rounded-lg p-6">
        <h2 className="text-sm font-heading font-bold text-navy-950 mb-1">
          Role Competency Framework
        </h2>
        <p className="text-xs text-ink-500 mb-2">
          Compared against the target benchmark for your role.
        </p>
        <div>
          {gaps.map((g) => (
            <GapRow
              key={g.domain}
              domain={g.domain}
              current={g.current_score}
              target={g.target}
              gap={g.gap}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
