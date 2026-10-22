"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ALL_BRANCHES = [
  "CSE",
  "IT",
  "RAI",
  "ME",
  "CE",
  "EE",
  "ECE",
  "BCA",
  "MCA",
  "BBA",
  "MBA",
  "BVoc",
  "BArch"
];

export default function AdminPage() {
  // Authentication State
  const [adminUser, setAdminUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Restore session asynchronously on mount to avoid hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = sessionStorage.getItem("tnp_admin_user");
        if (saved) {
          setAdminUser(JSON.parse(saved));
        }
      } catch {
        // Ignore session read error
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Drive Creation Form State
  const [formData, setFormData] = useState({
    company_name: "",
    job_role: "",
    job_description: "",
    drive_date: "",
    eligible_branches: ["CSE", "IT"],
    min_cgpa: "6.5",
    job_type: "FULL_TIME"
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Live Drives List
  const [recentDrives, setRecentDrives] = useState([]);
  const [loadingDrives, setLoadingDrives] = useState(false);

  // Initial load
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/placement/post");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setRecentDrives(data);
        }
      } catch {
        // Silent error
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch recent drives on demand
  const fetchRecentDrives = useCallback(async () => {
    setLoadingDrives(true);
    try {
      const res = await fetch("/api/placement/post");
      if (res.ok) {
        const data = await res.json();
        setRecentDrives(data);
      }
    } catch {
      // Silent error for table list
    } finally {
      setLoadingDrives(false);
    }
  }, []);

  // Handle Admin Login Submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check credentials.");
      }

      setAdminUser(data);
      sessionStorage.setItem("tnp_admin_user", JSON.stringify(data));
      setLoginPassword("");
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setAdminUser(null);
    sessionStorage.removeItem("tnp_admin_user");
  };

  // Handle Branch Checkbox Toggle
  const toggleBranch = (branch) => {
    setFormData((prev) => {
      const exists = prev.eligible_branches.includes(branch);
      return {
        ...prev,
        eligible_branches: exists
          ? prev.eligible_branches.filter((b) => b !== branch)
          : [...prev.eligible_branches, branch]
      };
    });
  };

  // Select / Deselect All Branches
  const handleSelectAllBranches = (selectAll) => {
    setFormData((prev) => ({
      ...prev,
      eligible_branches: selectAll ? [...ALL_BRANCHES] : []
    }));
  };

  // Handle Drive Form Submission
  const handleDriveSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      if (formData.eligible_branches.length === 0) {
        throw new Error("Please select at least one eligible branch.");
      }

      // Convert drive_date to valid ISO string if set
      const formattedDate = new Date(formData.drive_date).toISOString();

      const payload = {
        company_name: formData.company_name.trim(),
        job_role: formData.job_role.trim(),
        job_description: formData.job_description.trim(),
        drive_date: formattedDate,
        eligible_branches: formData.eligible_branches,
        min_cgpa: parseFloat(formData.min_cgpa) || 0,
        job_type: formData.job_type
      };

      const res = await fetch("/api/placement/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create placement drive.");
      }

      setFormSuccess(`Placement drive for ${data.company_name} (${data.job_role}) was posted successfully!`);

      // Reset form
      setFormData({
        company_name: "",
        job_role: "",
        job_description: "",
        drive_date: "",
        eligible_branches: ["CSE", "IT"],
        min_cgpa: "6.5",
        job_type: "FULL_TIME"
      });

      // Refresh recent drives list
      fetchRecentDrives();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Unauthenticated View: Admin Login Form
  if (!adminUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-700 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Authentication</h1>
            <p className="text-xs text-slate-500">
              Enter your Admin credentials from the database to post and manage placement drives.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@tnp.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In as Admin</span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link href="/" className="text-xs font-semibold text-blue-700 hover:underline">
              ← Return to Public Placement Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated View: Placement Drive Creation Form & Management Table
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Admin Greeting Bar */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            {adminUser.admin_name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Welcome, {adminUser.admin_name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Logged in as <span className="text-blue-700 font-semibold">{adminUser.admin_email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            View Public Portal
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition"
          >
            Logout
          </button>
        </div>
      </section>

      {/* Main Drive Creation Form */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register New Placement Drive</h2>
          <p className="text-xs text-slate-500 mt-1">
            Fill out the form below to publish an upcoming recruitment drive for GNDEC students.
          </p>
        </div>

        {/* Success Alert */}
        {formSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{formSuccess}</span>
            </div>
            <button onClick={() => setFormSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {formError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{formError}</span>
            </div>
            <button onClick={() => setFormError(null)} className="text-red-700 hover:text-red-900 font-bold text-xs">
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleDriveSubmit} className="space-y-6">
          {/* Row 1: Company Name & Job Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g. Google, Microsoft, Infosys"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Job Role / Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.job_role}
                onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                placeholder="e.g. Software Engineer, Data Analyst"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>
          </div>

          {/* Row 2: Drive Date, Min CGPA & Job Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Drive Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.drive_date}
                onChange={(e) => setFormData({ ...formData, drive_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Minimum CGPA (0.0 - 10.0) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={formData.min_cgpa}
                onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
                placeholder="6.5"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.job_type}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="PART_TIME">Part Time</option>
              </select>
            </div>
          </div>

          {/* Row 3: Eligible Branches Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Eligible Branches <span className="text-red-500">*</span>
              </label>
              <div className="space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectAllBranches(true)}
                  className="text-blue-700 font-semibold hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => handleSelectAllBranches(false)}
                  className="text-slate-500 hover:text-slate-700 font-semibold hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              {ALL_BRANCHES.map((branch) => {
                const isSelected = formData.eligible_branches.includes(branch);
                return (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => toggleBranch(branch)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      isSelected
                        ? "bg-blue-700 text-white border-blue-700 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span>{branch}</span>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Job Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Job Description & Selection Process <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.job_description}
              onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
              placeholder="Outline role responsibilities, CTC package, online assessment rounds, interview stages..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Placement Drive...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Publish Drive Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Live Recent Drives Management Table */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Placement Drives</h3>
            <p className="text-xs text-slate-500">Live records directly from PostgreSQL</p>
          </div>
          <button
            onClick={fetchRecentDrives}
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loadingDrives ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading records...</div>
        ) : recentDrives.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No placement drives found in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Min CGPA</th>
                  <th className="py-2.5 px-3">Eligible Branches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentDrives.map((d) => (
                  <tr key={d.placement_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-400">#{d.placement_id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{d.company_name}</td>
                    <td className="py-2.5 px-3 text-blue-700 font-semibold">{d.job_role}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                        {d.job_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-700">{d.min_cgpa}</td>
                    <td className="py-2.5 px-3">
                      {Array.isArray(d.eligible_branches) ? d.eligible_branches.join(", ") : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
