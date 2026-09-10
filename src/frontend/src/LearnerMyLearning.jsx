import { useEffect, useState } from "react";
import { Clock, FileQuestion } from "lucide-react";
import { api } from "./api";

function QuizRunner({ quiz, official, domain, onDone }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);

  const questions = quiz.questions;
  const q = questions[current];

  function selectAnswer(idx) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [current]: idx }));
  }

  async function finish() {
    const correct = questions.filter(
      (question, i) => answers[i] === question.correct_index
    ).length;
    const scorePercent = Math.round((correct / questions.length) * 100);
    setSubmitted(true);
    try {
      const result = await api.submitQuiz(official.id, domain, scorePercent);
      onDone(scorePercent, result);
    } catch (err) {
      onDone(scorePercent, null, err.message);
    }
  }

  if (submitted) {
    const correct = questions.filter(
      (question, i) => answers[i] === question.correct_index
    ).length;
    return (
      <div className="text-center py-8">
        <p className="text-3xl font-heading font-bold text-navy-950">
          {correct} / {questions.length}
        </p>
        <p className="text-sm text-ink-500 mt-2">Quiz submitted — your score has been recorded.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-ink-500">
          Question {current + 1} of {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i === current ? "bg-navy-900" : answers[i] !== undefined ? "bg-teal-700" : "bg-navy-100"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="font-medium text-ink-900 mb-4">{q.question}</p>

      <div className="space-y-2 mb-6">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => selectAnswer(idx)}
            className={`w-full text-left px-4 py-2.5 rounded-md border text-sm transition-colors ${
              answers[current] === idx
                ? "border-navy-900 bg-navy-100 font-medium"
                : "border-border hover:border-navy-700 hover:bg-navy-100/40"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="text-sm text-ink-500 hover:text-ink-900 transition-colors disabled:opacity-40 disabled:hover:text-ink-500"
        >
          Back
        </button>
        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            disabled={answers[current] === undefined}
            className="bg-navy-900 hover:bg-navy-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-40 disabled:hover:bg-navy-900"
          >
            Next
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={answers[current] === undefined}
            className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-40 disabled:hover:bg-teal-700"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}

export default function LearnerMyLearning({ official }) {
  const [recommendations, setRecommendations] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError("");
    try {
      const [recData, quizList] = await Promise.all([
        api.getRecommendations(official.id, 6),
        api.listQuizzes(),
      ]);
      setRecommendations(recData);
      setQuizzes(quizList);
    } catch (err) {
      setError(err.message);
    }
  }

  async function startQuiz(quizId, domain) {
    try {
      const full = await api.getQuiz(quizId);
      setActiveQuiz({ quiz: full, domain });
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return <p className="text-danger-600 bg-danger-100 px-4 py-3 rounded-md">{error}</p>;
  }
  if (!recommendations) {
    return <p className="text-ink-500 text-sm">Loading your learning plan...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-navy-950">My Learning</h1>
        <p className="text-sm text-ink-500 mt-1">
          Courses matched to your gaps, and quizzes ready for self-assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-sm font-heading font-bold text-navy-950 mb-4">
              Recommended For You
            </h2>
            {recommendations.length === 0 ? (
              <p className="text-sm text-ink-500">
                No urgent gaps found — you're meeting the benchmark across all domains.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.map((c) => (
                  <div
                    key={c.id}
                    className="border border-border rounded-md p-4 hover:border-navy-700 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-medium text-ink-900 text-sm leading-snug">
                        {c.title}
                      </h3>
                      <span className="flex items-center gap-1 text-xs text-ink-500 whitespace-nowrap ml-2 shrink-0">
                        <Clock size={12} /> {c.duration_hours}h
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 mb-2">
                      {c.domain} · {c.provider}
                    </p>
                    <p className="text-xs text-navy-700">{c.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-sm font-heading font-bold text-navy-950 mb-4">
              Self-Assessment Quiz
            </h2>

            {!activeQuiz && !quizResult && (
              <p className="text-sm text-ink-500">
                Pick an available quiz below to test yourself and update your score.
              </p>
            )}

            {activeQuiz && (
              <QuizRunner
                quiz={activeQuiz.quiz}
                official={official}
                domain={activeQuiz.domain}
                onDone={(score, result, err) => {
                  setQuizResult({ score, result, err });
                  setActiveQuiz(null);
                  load();
                }}
              />
            )}

            {quizResult && !activeQuiz && (
              <div>
                <p className="text-sm text-ink-900 mb-3">
                  Last quiz score: <strong>{quizResult.score}%</strong>
                </p>
                {quizResult.result && (
                  <p className="text-xs text-teal-700">
                    {quizResult.result.domain} competency updated: {quizResult.result.old_score} →{" "}
                    {quizResult.result.new_score}
                  </p>
                )}
                <button
                  onClick={() => setQuizResult(null)}
                  className="text-xs text-navy-700 hover:text-navy-900 underline mt-3 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </section>

          <section className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-sm font-heading font-bold text-navy-950 mb-3">
              Available Quizzes
            </h2>
            {quizzes.length === 0 ? (
              <p className="text-xs text-ink-500">
                None yet — an admin needs to generate one from a training document first.
              </p>
            ) : (
              <div className="space-y-2">
                {quizzes.slice(0, 6).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => startQuiz(q.id, q.domain)}
                    className="w-full flex items-center gap-2.5 text-left text-xs border border-border rounded-md px-3 py-2.5 hover:border-navy-700 hover:bg-navy-100/40 transition-colors"
                  >
                    <FileQuestion size={14} className="text-navy-700 shrink-0" />
                    <span>
                      <span className="font-medium text-ink-900">{q.source_filename}</span>
                      <span className="text-ink-500"> · {q.domain}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
