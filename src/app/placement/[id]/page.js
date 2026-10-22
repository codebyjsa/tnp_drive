import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlacementPosts } from "@/server/placement/placementService";
import { db } from "@/lib/db";
import ShareDriveButton from "@/components/ShareDriveButton";

export const dynamic = "force-dynamic";

function formatFullDate(isoString) {
  if (!isoString) return "Date to be announced";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata"
  });
}

export default async function PlacementDetailPage({ params }) {
  const resolvedParams = await params;
  const placementId = resolvedParams?.id;

  let drive = null;
  let admin = null;

  try {
    drive = await getPlacementPosts({ placement_id: placementId });
    if (drive?.created_by_admin_id) {
      admin = await db.admin.findUnique({
        where: { admin_id: drive.created_by_admin_id },
        select: { admin_name: true, admin_email: true }
      });
    }
  } catch (error) {
    console.error("Error fetching placement post:", error);
  }

  if (!drive) {
    notFound();
  }

  const branches = Array.isArray(drive.eligible_branches) ? drive.eligible_branches : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-700 transition group"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to All Drives</span>
        </Link>

        <ShareDriveButton companyName={drive.company_name} jobRole={drive.job_role} />
      </div>

      {/* Main Placement Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
              {drive.company_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {drive.company_name}
                </h1>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
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
              <p className="text-base sm:text-lg font-semibold text-blue-700 mt-0.5">
                {drive.job_role}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
            ID #{drive.placement_id}
          </span>
        </div>

        {/* Database Key Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Drive Date */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Drive Date
            </span>
            <p className="text-sm font-bold text-slate-900">
              {formatFullDate(drive.drive_date)}
            </p>
          </div>

          {/* Min CGPA */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Minimum CGPA
            </span>
            <p className="text-lg font-extrabold text-blue-700">
              {drive.min_cgpa ?? "N/A"}{" "}
              <span className="text-xs text-slate-500 font-semibold">CGPA</span>
            </p>
          </div>

          {/* Posted By Admin */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Posted By
            </span>
            <p className="text-sm font-bold text-slate-900 truncate">
              {admin?.admin_name || "T&P Administrator"}
            </p>
            {admin?.admin_email && (
              <p className="text-xs text-slate-500 truncate">{admin.admin_email}</p>
            )}
          </div>
        </div>

        {/* Eligible Branches */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Eligible Branches
          </h2>
          <div className="flex flex-wrap gap-2">
            {branches.length > 0 ? (
              branches.map((b) => (
                <span
                  key={b}
                  className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200/80"
                >
                  {b}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 font-medium">All Branches</span>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Job Description
          </h2>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
            {drive.job_description || "No description provided."}
          </div>
        </div>
      </div>

      {/* Bottom Back Button */}
      <div className="text-center pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
        >
          <span>← Back to All Drives</span>
        </Link>
      </div>
    </div>
  );
}
