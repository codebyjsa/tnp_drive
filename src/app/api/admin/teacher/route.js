import { NextResponse } from "next/server";
import { createTeacher, ServiceError } from "@/server/admin/adminService";

/**
 * POST /api/admin/teacher
 * Body: { admin_id, teacher_name, teacher_dept }
 */
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const data = await createTeacher(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const statusCode = error instanceof ServiceError ? error.statusCode : (error.statusCode || 500);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: statusCode }
    );
  }
}
