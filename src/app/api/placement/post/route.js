import { NextResponse } from "next/server";
import {
  createPlacementPost,
  getPlacementPosts
} from "@/server/placement/placementService";
import { ServiceError } from "@/lib/utils";

/**
 * POST /api/placement/post
 * Body: { company_name, job_Role, drive_date, job_title, job_description, eligible_branches, min_cgpa, job_type }
 */
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const data = await createPlacementPost(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const statusCode = error instanceof ServiceError ? error.statusCode : (error.statusCode || 500);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/placement/post
 * Query parameter: ?placement_id=... (optional)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const placement_id = searchParams.get("placement_id") || undefined;

    const data = await getPlacementPosts({ placement_id });
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const statusCode = error instanceof ServiceError ? error.statusCode : (error.statusCode || 500);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: statusCode }
    );
  }
}
