"use client";

import { useState } from "react";
import Link from "next/link";

export default function DrivesClient({ initialDrives = [] }) {
  const [drives, setDrives] = useState(initialDrives);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedJobType, setSelectedJobType] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Manual client-side refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetch("/api/placement/post");
      if (!response.ok) {
        throw new Error(`Failed to fetch placement drives (Status: ${response.status})`);
      }
      const data = await response.json();
      setDrives(data);
    } catch (err) {
      setError(err.message || "An error occurred while loading drives");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter drives based on user search, branch, and job type
  const filteredDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.job_role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.job_description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch =
      selectedBranch === "ALL" ||
      (Array.isArray(drive.eligible_branches) && drive.eligible_branches.includes(selectedBranch));

    const matchesJobType =
      selectedJobType === "ALL" || drive.job_type === selectedJobType;

    return matchesSearch && matchesBranch && matchesJobType;
  });

  // Format ISO date into a readable string
  const formatDriveDate = (isoString) => {
    if (!isoString) return "Date TBD";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header Section */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200 uppercase tracking-wider">
            <span>Official Portal</span> • <span>T&P Cell GNDEC</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Campus Placement & <br className="hidden sm:inline" />
            <span className="text-blue-300">Recruitment Drives</span>
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            Welcome to Guru Nanak Dev Engineering College Training & Placement Cell. Explore visiting companies, eligibility criteria, and upcoming campus interview schedules.
          </p>

          
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, job role, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Branch Filter */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            >
              <option value="ALL">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EE">EE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
              <option value="RAI">RAI</option>
              <option value="BCA">BCA</option>
              <option value="MCA">MCA</option>
              <option value="BBA">BBA</option>
              <option value="MBA">MBA</option>
            </select>

            {/* Job Type Filter */}
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            >
              <option value="ALL">All Job Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="PART_TIME">Part Time</option>
            </select>

            {/* View Mode Toggle Button */}
            <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-100">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid Card View"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid" ? "bg-white text-blue-700 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "table" ? "bg-white text-blue-700 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter & Refresh */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-700">{filteredDrives.length}</strong> of{" "}
            <strong className="text-slate-700">{drives.length}</strong> placement drives
          </span>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? "Refreshing..." : "Refresh List"}</span>
          </button>
        </div>
      </section>

      {/* Main Placement Drives Content */}
      <section>
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3 mb-6">
            <h3 className="text-base font-bold text-red-900">Failed to Refresh Drives</h3>
            <p className="text-sm text-red-700 max-w-md mx-auto">{error}</p>
            <button
              onClick={handleManualRefresh}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredDrives.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Placement Drives Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {drives.length === 0
                ? "No placement drives have been registered in the system yet."
                : "No drives match your current filter and search criteria."}
            </p>
            {drives.length === 0 ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition"
              >
                <span>Post First Drive</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedBranch("ALL");
                  setSelectedJobType("ALL");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* View Mode: Card Grid Layout */}
        {filteredDrives.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrives.map((drive) => (
              <div
                key={drive.placement_id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition group"
              >
                <div className="space-y-4">
                  {/* Top Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <Link
                          href={`/placement/${drive.placement_id}`}
                          className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition block"
                        >
                          {drive.company_name}
                        </Link>
                        <p className="text-sm font-semibold text-slate-600">{drive.job_role}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        drive.job_type === "FULL_TIME"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : drive.job_type === "INTERNSHIP"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {drive.job_type?.replace("_", " ")}
                    </span>
                  </div>

                  {/* Drive Date Banner */}
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                    <svg className="w-4 h-4 text-blue-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span><strong>Drive Date:</strong> {formatDriveDate(drive.drive_date)}</span>
                  </div>

                  {/* Job Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {drive.job_description}
                  </p>
                </div>

                {/* Bottom Card Footer with Badges & Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                  {/* Min CGPA */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Eligibility Threshold:</span>
                    <span className="font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      Min CGPA: {drive.min_cgpa ?? "N/A"}
                    </span>
                  </div>

                  {/* Eligible Branches Badges */}
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                      Eligible Branches
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(drive.eligible_branches) && drive.eligible_branches.map((b) => (
                        <span
                          key={b}
                          className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* View Details Link */}
                  <div className="pt-2">
                    <Link
                      href={`/placement/${drive.placement_id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-blue-700 text-slate-700 hover:text-white font-bold text-xs uppercase tracking-wider transition group/btn"
                    >
                      <span>View Details & Eligibility</span>
                      <svg
                        className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Mode: Compact Table Layout */}
        {filteredDrives.length > 0 && viewMode === "table" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Job Type</th>
                    <th className="py-3.5 px-4">Drive Date</th>
                    <th className="py-3.5 px-4">Min CGPA</th>
                    <th className="py-3.5 px-4">Eligible Branches</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredDrives.map((drive) => (
                    <tr key={drive.placement_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <Link href={`/placement/${drive.placement_id}`} className="hover:text-blue-700 transition">
                          {drive.company_name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-blue-700 font-semibold">{drive.job_role}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700 border border-slate-200">
                          {drive.job_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{formatDriveDate(drive.drive_date)}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-700">{drive.min_cgpa}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {Array.isArray(drive.eligible_branches) && drive.eligible_branches.map((b) => (
                            <span key={b} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/placement/${drive.placement_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          <span>Details</span>
                          <span>→</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
