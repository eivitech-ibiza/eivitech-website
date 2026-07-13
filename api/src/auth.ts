import type { NextFunction, Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { query } from "./db.js";

type CrmUser = {
  id: string;
  clerk_user_id: string | null;
  email: string;
  name: string | null;
  role: "admin" | "manager" | "operator" | "viewer";
  active: boolean;
};

declare global {
  // Express uses namespace declaration merging for request augmentation.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      crmUser?: CrmUser;
    }
  }
}

const bootstrapEmails = (process.env.BOOTSTRAP_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function requireCrmUser(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);

    if (!auth.isAuthenticated || !auth.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const clerkUser = await clerkClient.users.getUser(auth.userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase();
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || null;

    if (!email) {
      return res.status(403).json({ error: "Authenticated user has no primary email" });
    }

    let result = await query<CrmUser>(
      "SELECT id, clerk_user_id, email, name, role, active FROM crm_users WHERE clerk_user_id = $1 OR email = $2 LIMIT 1",
      [auth.userId, email]
    );

    if (result.rows.length === 0 && bootstrapEmails.includes(email)) {
      result = await query<CrmUser>(
        `INSERT INTO crm_users (clerk_user_id, email, name, role, active)
         VALUES ($1, $2, $3, 'admin', true)
         ON CONFLICT (email) DO UPDATE SET clerk_user_id = EXCLUDED.clerk_user_id, updated_at = now()
         RETURNING id, clerk_user_id, email, name, role, active`,
        [auth.userId, email, name]
      );
    }

    const crmUser = result.rows[0];

    if (!crmUser || !crmUser.active) {
      return res.status(403).json({ error: "User is not authorized for CRM access" });
    }

    req.crmUser = crmUser;
    return next();
  } catch (error) {
    console.error("[auth] CRM authorization failed", error);
    return res.status(500).json({ error: "Authorization failed" });
  }
}

export function requireRole(roles: CrmUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.crmUser) return res.status(401).json({ error: "Missing CRM user" });
    if (!roles.includes(req.crmUser.role)) return res.status(403).json({ error: "Insufficient permissions" });
    return next();
  };
}
