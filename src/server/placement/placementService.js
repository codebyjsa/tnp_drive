import { db } from "@/lib/db";
import { ServiceError, serializeBigInt } from "@/lib/utils";

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

export const VALID_JOB_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP"
];

/**
 * Creates a new placement post.
 * Requires exact casing matching prisma schema:
 * company_name, job_role, job_description, drive_date, eligible_branches, min_cgpa, job_type
 */
export async function createPlacementPost(data) {
  const company_name = (data.company_name);
  const job_role = (data.job_role);
  const job_description = (data.job_description);
  const rawDriveDate = data.drive_date;
  const eligible_branches = data.eligible_branches;
  const rawMinCgpa = data.min_cgpa;
  const job_type = (data.job_type);

  if (!company_name) {
    throw new ServiceError("company_name is required", 400);
  }

  if (!job_role) {
    throw new ServiceError("job_role is required", 400);
  }

  if (!job_description) {
    throw new ServiceError("job_description is required", 400);
  }

  if (!rawDriveDate) {
    throw new ServiceError("drive_date is required", 400);
  }

  const drive_date = new Date(rawDriveDate);
  if (isNaN(drive_date.getTime())) {
    throw new ServiceError("drive_date must be a valid date string (e.g. ISO 8601)", 400);
  }

  if (!Array.isArray(eligible_branches) || eligible_branches.length === 0) {
    throw new ServiceError(`eligible_branches must be a non-empty array. Allowed branches: ${VALID_BRANCHES.join(", ")}`, 400);
  }

  for (const branch of eligible_branches) {
    if (!VALID_BRANCHES.includes(branch)) {
      throw new ServiceError(`Invalid branch "${branch}" in eligible_branches. Allowed values: ${VALID_BRANCHES.join(", ")}`, 400);
    }
  }

  if (rawMinCgpa === undefined || rawMinCgpa === null || rawMinCgpa === "") {
    throw new ServiceError("min_cgpa is required", 400);
  }

  const min_cgpa = parseFloat(rawMinCgpa);
  if (isNaN(min_cgpa) || min_cgpa < 0 || min_cgpa > 10) {
    throw new ServiceError("min_cgpa must be a number between 0.0 and 10.0", 400);
  }

  if (!job_type) {
    throw new ServiceError(`job_type is required. Allowed values: ${VALID_JOB_TYPES.join(", ")}`, 400);
  }

  if (!VALID_JOB_TYPES.includes(job_type)) {
    throw new ServiceError(`Invalid job_type: "${job_type}". Allowed values: ${VALID_JOB_TYPES.join(", ")}`, 400);
  }

  const post = await db.placement_posts.create({
    data: {
      company_name,
      job_role,
      job_description,
      drive_date,
      eligible_branches,
      min_cgpa,
      job_type
    }
  });

  return serializeBigInt(post);
}

/**
 * Retrieves placement post(s).
 * If placement_id is provided, returns that specific post.
 * If placement_id is omitted, returns all placement posts ordered by creation date descending.
 */
export async function getPlacementPosts({ placement_id } = {}) {
  if (placement_id !== undefined && placement_id !== null && placement_id !== "") {
    let id;
    try {
      id = BigInt(placement_id);
    } catch {
      throw new ServiceError("placement_id must be a valid integer", 400);
    }

    const post = await db.placement_posts.findUnique({
      where: { placement_id: id }
    });

    if (!post) {
      throw new ServiceError(`Placement post with id "${placement_id}" not found`, 404);
    }

    return serializeBigInt(post);
  }

  const posts = await db.placement_posts.findMany({
    orderBy: { created_at: "desc" }
  });

  return serializeBigInt(posts);
}

const placementService = {
  VALID_BRANCHES,
  VALID_JOB_TYPES,
  createPlacementPost,
  getPlacementPosts
};

export default placementService;
