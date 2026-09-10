// api.js — thin wrapper around fetch for talking to our FastAPI backend.
// Centralizing this means: one place to change the base URL when we
// deploy (Day 3), one place to attach the auth token, one place to
// handle errors consistently across every screen.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return sessionStorage.getItem("token");
  // NOTE: sessionStorage, not localStorage — token clears when the tab
  // closes, which is fine for a hackathon demo and avoids stale-login
  // confusion during rehearsals.
}

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.detail
      ? typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail)
      : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  health: () => request("/health"),

  login: (username, password) =>
    request("/auth/login", { method: "POST", body: { username, password } }),

  getProfile: (officialId) => request(`/officials/${officialId}/profile`),

  getGapAnalysis: (officialId) => request(`/officials/${officialId}/gap-analysis`),

  getStats: (officialId) => request(`/officials/${officialId}/stats`),

  getRecommendations: (officialId, topN = 5) =>
    request(`/officials/${officialId}/recommendations?top_n=${topN}`),

  getCourses: (domain) => request(domain ? `/courses?domain=${domain}` : "/courses"),

  generateQuiz: (file, domain, officialId, numQuestions = 5) => {
    const form = new FormData();
    form.append("file", file);
    form.append("domain", domain);
    form.append("official_id", officialId ?? 0);
    form.append("num_questions", numQuestions);
    return request("/quiz/generate", { method: "POST", body: form, isFormData: true });
  },

  listQuizzes: () => request("/quizzes"),

  getQuiz: (quizId) => request(`/quizzes/${quizId}`),

  submitQuiz: (officialId, domain, scorePercent) =>
    request("/quiz/submit", {
      method: "POST",
      body: { official_id: officialId, domain, score_percent: scorePercent },
    }),

  getAdminAnalytics: () => request("/admin/analytics"),
};

export { getToken };
