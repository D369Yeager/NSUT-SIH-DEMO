import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Users, FileQuestion } from "lucide-react";
import { api } from "./api";

const DOMAIN_COLORS = {
  Statistical: "#0b3d62",
  Technical: "#c99a2e",
  "Digital Governance": "#1f7a6c",
  "Behavioural/Managerial": "#b3432f",
};

export default function AdminInsights() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    api.getAdminAnalytics().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p className="text-danger-600 bg-danger-100 px-4 py-3 rounded-md">{error}</p>;
  }
  if (!data) {
    return <p className="text-ink-500 text-sm">Loading analytics...</p>;
  }

  const chartData = data.domain_averages.map((d) => ({
    domain: d.domain,
    score: d.avg_score,
  }));

  const departments = [...new Set(data.department_breakdown.map((d) => d.department))];
  const deptRows = selectedDept
    ? data.department_breakdown.filter((d) => d.department === selectedDept)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-navy-950">Insights</h1>
        <p className="text-sm text-ink-500 mt-1">
          Org-wide learning signals to inform training decisions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-border rounded-lg p-5 hover:border-navy-700 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-md bg-navy-100 text-navy-900 flex items-center justify-center">
              <Users size={16} />
            </div>
            <p className="text-xs text-ink-500">Total Officials Tracked</p>
          </div>
          <p className="text-3xl font-heading font-bold text-navy-950">
            {data.total_officials}
          </p>
        </div>
        <div className="bg-white border border-border rounded-lg p-5 hover:border-navy-700 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-md bg-gold-100 text-gold-600 flex items-center justify-center">
              <FileQuestion size={16} />
            </div>
            <p className="text-xs text-ink-500">Quizzes Generated</p>
          </div>
          <p className="text-3xl font-heading font-bold text-navy-950">
            {data.total_quizzes_generated}
          </p>
        </div>
      </div>

      <section className="bg-white border border-border rounded-lg p-6">
        <h2 className="text-sm font-heading font-bold text-navy-950 mb-1">
          Org-Wide Competency Averages
        </h2>
        <p className="text-xs text-ink-500 mb-5">Average score per domain, across all officials.</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" />
            <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={DOMAIN_COLORS[entry.domain] || "#0b3d62"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="bg-white border border-border rounded-lg p-6">
        <h2 className="text-sm font-heading font-bold text-navy-950 mb-1">
          Department Drill-Down
        </h2>
        <p className="text-xs text-ink-500 mb-4">Click a department to see its domain breakdown.</p>
        <div className="flex gap-2 flex-wrap mb-5">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept === selectedDept ? null : dept)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedDept === dept
                  ? "bg-navy-900 text-white border-navy-900"
                  : "border-border text-ink-500 hover:border-navy-700 hover:text-navy-900"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {selectedDept && (
          <div className="space-y-3">
            {deptRows.map((row) => (
              <div key={row.domain} className="flex items-center justify-between">
                <span className="text-sm text-ink-900">{row.domain}</span>
                <div className="flex items-center gap-3 flex-1 max-w-xs ml-4">
                  <div className="h-2 flex-1 rounded-full bg-navy-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.avg_score}%`,
                        backgroundColor: DOMAIN_COLORS[row.domain] || "#0b3d62",
                      }}
                    />
                  </div>
                  <span className="text-xs text-ink-500 w-10 text-right">{row.avg_score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
