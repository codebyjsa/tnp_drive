import { NextResponse } from "next/server";
import { adminLogin } from "@/server/admin/adminService";
import { ServiceError } from "@/lib/utils";

/**
 * POST /api/admin/login
 * Body: { email, password }
 */
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const admin = await adminLogin(body);
    return NextResponse.json(admin, { status: 200 });
  } catch (error) {
    const statusCode = error instanceof ServiceError ? error.statusCode : (error.statusCode || 500);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: statusCode }
    );
  }
}
