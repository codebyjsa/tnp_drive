export class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ServiceError";
    this.statusCode = statusCode;
  }
}

/**
 * Safely converts BigInt values to string for JSON serialization.
 */
export function serializeBigInt(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const copy = {};
    for (const [key, value] of Object.entries(obj)) {
      copy[key] = serializeBigInt(value);
    }
    return copy;
  }
  return obj;
}

const utils = {
  ServiceError,
  serializeBigInt
};

export default utils;
