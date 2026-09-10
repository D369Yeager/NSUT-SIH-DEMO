import { useState } from "react";
import { api } from "./api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(username, password);
      sessionStorage.setItem("token", data.token);
      onLogin({ id: data.official_id, name: data.name, role: data.role });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy-900 text-gold-500 font-heading font-bold text-lg mb-4">
            SI
          </div>
          <h1 className="text-2xl font-heading font-bold text-navy-950">
            Skill Intelligence Platform
          </h1>
          <p className="text-sm text-ink-500 mt-1">iGOT Karmayogi Integration</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="anita"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-danger-600 bg-danger-100 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-900 hover:bg-navy-700 text-white font-medium text-sm rounded-md py-2.5 transition-colors disabled:opacity-60 disabled:hover:bg-navy-900"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-ink-500 text-center mt-4 hover:text-ink-900 transition-colors">
          Demo accounts — learner: anita / demo123 · admin: priya / admin123
        </p>
      </div>
    </div>
  );
}
