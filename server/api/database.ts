import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../auth";
import { successResponse, asyncHandler, notFoundError } from "../middleware/error-handling";
import { db } from "../db";
import { sql } from "drizzle-orm";

const router = Router();

/**
 * @api {get} /api/database/export Export database data as JSON
 * @apiDescription This endpoint allows an admin to export all data from a specific table.
 * Used for local backups.
 */
router.get("/export/:table", requireAdmin, asyncHandler(async (req, res) => {
  const { table } = req.params;
  
  // Basic security check for table name to prevent SQL injection
  if (!/^[a-z0-9_]+$/i.test(table)) {
    return res.status(400).json({ message: "Invalid table name" });
  }

  try {
    const result = await db.execute(sql.raw(`SELECT * FROM "${table}"`));
    successResponse(res, result.rows, `Exported ${result.rows.length} rows from ${table}`);
  } catch (error: any) {
    console.error(`Export failed for table ${table}:`, error);
    res.status(500).json({ message: `Export failed: ${error.message}` });
  }
}));

/**
 * @api {get} /api/database/tables List all tables
 */
router.get("/tables", requireAdmin, asyncHandler(async (req, res) => {
  const result = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  successResponse(res, result.rows.map(r => r.table_name), "Tables retrieved successfully");
}));

export default router;
