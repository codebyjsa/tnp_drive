import { db } from "@/lib/db";
import { ServiceError, serializeBigInt } from "@/lib/utils";
import { validate as uuidValidate } from "uuid";

export { ServiceError, serializeBigInt };

export const VALID_BRANCHES = [
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

/**
 * Validates a UUID string.
 */
export function isValidUuid(str) {
  return typeof str === "string" && uuidValidate(str);
}

/**
 * Creates an admin or returns existing if matched by email.
 */
export async function createAdmin(data) {
  const admin_name = (data.admin_name).trim();
  const admin_email = (data.admin_email).trim().toLowerCase();
  const admin_password = data.admin_password;

  if (!admin_name) {
    throw new ServiceError("Admin name is required", 400);
  }
  if (!admin_email) {
    throw new ServiceError("Admin email is required", 400);
  }
  if (!admin_password) {
    throw new ServiceError("Admin password is required", 400);
  }

  const existing = await db.admin.findUnique({
    where: { admin_email }
  });
  if (existing) {
    throw new ServiceError("Admin with this email already exists", 409);
  }

  const admin = await db.admin.create({
    data: {
      admin_name,
      admin_email,
      admin_password
    }
  });

  return serializeBigInt(admin);
}

/**
 * Creates a student record linked to an admin.
 * Matches prisma schema lines 31-54.
 */
export async function createStudent(data) {
  const email = (data.email || data.admin_email || "").trim().toLowerCase();
  const password = data.password || data.admin_password || "";
  const student_name = (data.student_name || "").trim();
  const rawCrn = data.crn;
  const rawUrn = data.urn;
  const student_dept = (data.student_dept || "").trim();
  const rawYear = data.student_year;

  if (!student_name) {
    throw new ServiceError("student_name is required", 400);
  }

  if (rawCrn === undefined || rawCrn === null || rawCrn === "") {
    throw new ServiceError("crn is required", 400);
  }

  if (rawUrn === undefined || rawUrn === null || rawUrn === "") {
    throw new ServiceError("urn is required", 400);
  }

  let crn;
  try {
    crn = BigInt(rawCrn);
  } catch {
    throw new ServiceError("crn must be a valid integer", 400);
  }

  let urn;
  try {
    urn = BigInt(rawUrn);
  } catch {
    throw new ServiceError("urn must be a valid integer", 400);
  }

  if (!student_dept) {
    throw new ServiceError(`student_dept is required. Allowed values: ${VALID_BRANCHES.join(", ")}`, 400);
  }

  if (!VALID_BRANCHES.includes(student_dept)) {
    throw new ServiceError(`Invalid student_dept: "${student_dept}". Allowed values: ${VALID_BRANCHES.join(", ")}`, 400);
  }

  if (rawYear === undefined || rawYear === null || rawYear === "") {
    throw new ServiceError("student_year is required", 400);
  }

  const student_year = parseInt(rawYear, 10);
  if (isNaN(student_year) || student_year <= 0) {
    throw new ServiceError("student_year must be a positive integer", 400);
  }

  // Check unique constraints for CRN and URN
  const existingCrn = await db.student.findUnique({ where: { crn } });
  if (existingCrn) {
    throw new ServiceError(`Student with CRN ${crn.toString()} already exists`, 409);
  }

  const existingUrn = await db.student.findUnique({ where: { urn } });
  if (existingUrn) {
    throw new ServiceError(`Student with URN ${urn.toString()} already exists`, 409);
  }

  // If admin_id is provided directly, verify it exists; otherwise require email and password
  let admin_id = data.admin_id;

  if (!admin_id) {
    if (!email) {
      throw new ServiceError("email is required", 400);
    }
    if (!password) {
      throw new ServiceError("password is required", 400);
    }

    const existingEmail = await db.admin.findUnique({ where: { admin_email: email } });
    if (existingEmail) {
      throw new ServiceError("User with this email already exists", 409);
    }

    try {
      const student = await db.$transaction(async (tx) => {
        const admin = await tx.admin.create({
          data: {
            admin_name: student_name,
            admin_email: email,
            admin_password: password
          }
        });

        return tx.student.create({
          data: {
            admin_id: admin.admin_id,
            student_name,
            crn,
            urn,
            student_dept,
            student_year
          },
          include: {
            admin: {
              select: {
                admin_id: true,
                admin_name: true,
                admin_email: true
              }
            }
          }
        });
      });

      return serializeBigInt(student);
    } catch (err) {
      if (err.code === "P2002") {
        throw new ServiceError("A user with this email, CRN, or URN already exists", 409);
      }
      throw err;
    }
  }

  if (!isValidUuid(admin_id)) {
    throw new ServiceError("admin_id must be a valid UUID", 400);
  }

  const admin = await db.admin.findUnique({ where: { admin_id } });
  if (!admin) {
    throw new ServiceError(`Admin with id "${admin_id}" not found`, 404);
  }

  try {
    const student = await db.student.create({
      data: {
        admin_id,
        student_name,
        crn,
        urn,
        student_dept,
        student_year
      },
      include: {
        admin: {
          select: {
            admin_id: true,
            admin_name: true,
            admin_email: true
          }
        }
      }
    });

    return serializeBigInt(student);
  } catch (err) {
    if (err.code === "P2002") {
      throw new ServiceError("A student with this CRN or URN already exists", 409);
    }
    throw err;
  }
}

/**
 * Creates a teacher record linked to an admin.
 * Matches prisma schema lines 31-41 & 56-64.
 */
export async function createTeacher(data) {
  const email = (data.email || data.admin_email || "").trim().toLowerCase();
  const password = data.password || data.admin_password || "";
  const teacher_name = (data.teacher_name || "").trim();
  const teacher_dept = (data.teacher_dept || "").trim();

  if (!teacher_name) {
    throw new ServiceError("teacher_name is required", 400);
  }

  if (!teacher_dept) {
    throw new ServiceError("teacher_dept is required", 400);
  }

  // If admin_id is provided directly, verify it exists; otherwise require email and password
  let admin_id = data.admin_id;

  if (!admin_id) {
    if (!email) {
      throw new ServiceError("email is required", 400);
    }
    if (!password) {
      throw new ServiceError("password is required", 400);
    }

    const existingEmail = await db.admin.findUnique({ where: { admin_email: email } });
    if (existingEmail) {
      throw new ServiceError("User with this email already exists", 409);
    }

    try {
      const teacher = await db.$transaction(async (tx) => {
        const admin = await tx.admin.create({
          data: {
            admin_name: teacher_name,
            admin_email: email,
            admin_password: password
          }
        });

        return tx.teacher.create({
          data: {
            admin_id: admin.admin_id,
            teacher_name,
            teacher_dept
          },
          include: {
            admin: {
              select: {
                admin_id: true,
                admin_name: true,
                admin_email: true
              }
            }
          }
        });
      });

      return serializeBigInt(teacher);
    } catch (err) {
      if (err.code === "P2002") {
        throw new ServiceError("A user with this email already exists", 409);
      }
      throw err;
    }
  }

  if (!isValidUuid(admin_id)) {
    throw new ServiceError("admin_id must be a valid UUID", 400);
  }

  const admin = await db.admin.findUnique({ where: { admin_id } });
  if (!admin) {
    throw new ServiceError(`Admin with id "${admin_id}" not found`, 404);
  }

  const teacher = await db.teacher.create({
    data: {
      admin_id,
      teacher_name,
      teacher_dept
    },
    include: {
      admin: {
        select: {
          admin_id: true,
          admin_name: true,
          admin_email: true
        }
      }
    }
  });

  return serializeBigInt(teacher);
}

/**
 * Retrieves user(s) based on query parameters:
 * adminId, studentId, teacherId
 */
export async function getUsers({ adminId, studentId, teacherId } = {}) {
  const result = {};
  const requestedFilters = [];

  if (adminId) requestedFilters.push("adminId");
  if (studentId) requestedFilters.push("studentId");
  if (teacherId) requestedFilters.push("teacherId");

  if (adminId) {
    if (!isValidUuid(adminId)) {
      throw new ServiceError("adminId must be a valid UUID", 400);
    }
    const admin = await db.admin.findUnique({
      where: { admin_id: adminId },
      include: {
        students: true,
        teachers: true
      }
    });
    if (!admin && requestedFilters.length === 1) {
      throw new ServiceError(`Admin with id "${adminId}" not found`, 404);
    }
    result.admin = admin ? serializeBigInt(admin) : null;
  }

  if (studentId) {
    let parsedStudentId;
    try {
      parsedStudentId = BigInt(studentId);
    } catch {
      throw new ServiceError("studentId must be a valid integer/BigInt", 400);
    }

    const student = await db.student.findUnique({
      where: { student_id: parsedStudentId },
      include: {
        admin: {
          select: {
            admin_id: true,
            admin_name: true,
            admin_email: true
          }
        }
      }
    });
    if (!student && requestedFilters.length === 1) {
      throw new ServiceError(`Student with id "${studentId}" not found`, 404);
    }
    result.student = student ? serializeBigInt(student) : null;
  }

  if (teacherId) {
    if (!isValidUuid(teacherId)) {
      throw new ServiceError("teacherId must be a valid UUID", 400);
    }
    const teacher = await db.teacher.findUnique({
      where: { teacher_id: teacherId },
      include: {
        admin: {
          select: {
            admin_id: true,
            admin_name: true,
            admin_email: true
          }
        }
      }
    });
    if (!teacher && requestedFilters.length === 1) {
      throw new ServiceError(`Teacher with id "${teacherId}" not found`, 404);
    }
    result.teacher = teacher ? serializeBigInt(teacher) : null;
  }

  // If no filters were provided, return all users grouped
  if (requestedFilters.length === 0) {
    const [admins, students, teachers] = await Promise.all([
      db.admin.findMany({
        select: {
          admin_id: true,
          admin_name: true,
          admin_email: true,
          created_at: true,
          updated_at: true
        }
      }),
      db.student.findMany(),
      db.teacher.findMany()
    ]);

    return {
      admins: serializeBigInt(admins),
      students: serializeBigInt(students),
      teachers: serializeBigInt(teachers)
    };
  }

  // If a single filter was requested, return that entity directly or return the result object
  if (requestedFilters.length === 1) {
    const key = requestedFilters[0].replace("Id", "");
    return result[key];
  }

  return result;
}

const adminService = {
  VALID_BRANCHES,
  ServiceError,
  serializeBigInt,
  isValidUuid,
  createAdmin,
  createStudent,
  createTeacher,
  getUsers
};

export default adminService;
