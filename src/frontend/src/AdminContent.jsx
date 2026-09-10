import { useEffect, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { api } from "./api";

const DOMAINS = ["Statistical", "Technical", "Digital Governance", "Behavioural/Managerial"];

export default function AdminContent() {
  const [file, setFile] = useState(null);
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);

  useEffect(() => {
    loadRecent();
  }, []);

  async function loadRecent() {
    try {
      const list = await api.listQuizzes();
      setRecentQuizzes(list.slice(0, 8));
    } catch {
      // non-critical — just skip showing recent list if this fails
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setQuiz(null);
    try {
      const result = await api.generateQuiz(file, domain, null, numQuestions);
      setQuiz(result);
      loadRecent();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-navy-950">Content & Quizzes</h1>
        <p className="text-sm text-ink-500 mt-1">
          Upload training material — a quiz is generated and made available to learners automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-1">
              <UploadCloud size={17} className="text-navy-700" />
              <h2 className="text-sm font-heading font-bold text-navy-950">
                Upload Training Document
              </h2>
            </div>
            <p className="text-xs text-ink-500 mb-5">PDF, DOCX, or TXT.</p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-900 mb-1">
                  Document
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-navy-100 file:text-navy-900 file:text-xs file:font-medium hover:file:bg-navy-700 hover:file:text-white file:transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-900 mb-1">
                  Competency Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm hover:border-navy-700 transition-colors"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-900 mb-1">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm hover:border-navy-700 transition-colors"
                />
              </div>

              {error && (
                <p className="text-sm text-danger-600 bg-danger-100 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-gold-600 hover:bg-gold-500 text-white font-medium text-sm rounded-md py-2.5 transition-colors disabled:opacity-50 disabled:hover:bg-gold-600"
              >
                {loading ? "Generating quiz..." : "Generate Quiz"}
              </button>
            </form>
          </section>

          <section className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-sm font-heading font-bold text-navy-950 mb-3">
              Recently Generated
            </h2>
            {recentQuizzes.length === 0 ? (
              <p className="text-xs text-ink-500">No quizzes generated yet.</p>
            ) : (
              <div className="space-y-2">
                {recentQuizzes.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-2 text-xs border border-border rounded-md px-3 py-2 hover:border-navy-700 transition-colors"
                  >
                    <FileText size={13} className="text-navy-700 shrink-0" />
                    <span>
                      <span className="font-medium text-ink-900">{q.source_filename}</span>
                      <span className="text-ink-500"> · {q.domain}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-2">
          <section className="bg-white border border-border rounded-lg p-6 min-h-75">
            <h2 className="text-sm font-heading font-bold text-navy-950 mb-4">
              Generated Quiz Preview
            </h2>

            {!quiz && (
              <p className="text-sm text-ink-500">
                Upload a document to see the generated questions here.
              </p>
            )}

            {quiz && (
              <div className="space-y-5">
                <p className="text-xs text-ink-500">
                  Model used: <span className="font-mono">{quiz.model_used}</span> · Quiz ID: {quiz.quiz_id}
                </p>
                {quiz.questions.map((q, i) => (
                  <div
                    key={i}
                    className="border border-border rounded-md p-4 hover:border-navy-700 transition-colors"
                  >
                    <p className="font-medium text-sm text-ink-900 mb-2">
                      {i + 1}. {q.question}
                    </p>
                    <div className="space-y-1 mb-2">
                      {q.options.map((opt, idx) => (
                        <p
                          key={idx}
                          className={`text-xs px-2 py-1 rounded ${
                            idx === q.correct_index
                              ? "bg-teal-100 text-teal-700 font-medium"
                              : "text-ink-500"
                          }`}
                        >
                          {opt}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-ink-500 italic">{q.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
