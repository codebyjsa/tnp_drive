import { NextResponse } from "next/server";
import { getUsers, createAdmin, ServiceError } from "@/server/admin/adminService";

/**
 * GET /api/admin
 * Query parameters: adminId, studentId, teacherId
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId") || undefined;
    const studentId = searchParams.get("studentId") || undefined;
    const teacherId = searchParams.get("teacherId") || undefined;

    const data = await getUsers({ adminId, studentId, teacherId });
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const statusCode = error instanceof ServiceError ? error.statusCode : (error.statusCode || 500);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: statusCode }
    );
  }
}

/**
 * POST /api/admin
 * Body: { admin_name, admin_email, admin_password }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const newAdmin = await createAdmin(body);
    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error) {
    const statusCode = error instanceof ServiceError ? error.statusCode : (error.statusCode || 500);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: statusCode }
    );
  }
}

