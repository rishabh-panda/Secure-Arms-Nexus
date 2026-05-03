import { Router } from "express";
import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { logAudit } from "../lib/audit";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const { email, password, firstName, lastName, dateOfBirth, agreedToTerms } = parsed.data;

  if (!agreedToTerms) {
    res.status(400).json({ error: "Terms required", message: "You must agree to terms" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email taken", message: "Email already registered" });
    return;
  }

  // Age verification: must be 21+
  const dob = new Date(dateOfBirth);
  const ageDiff = Date.now() - dob.getTime();
  const ageDate = new Date(ageDiff);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  const isAgeVerified = age >= 21;

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    firstName,
    lastName,
    dateOfBirth: typeof dateOfBirth === "string" ? dateOfBirth : dateOfBirth.toISOString().split("T")[0],
    agreedToTerms: true,
    isAgeVerified,
    role: "guest",
    kycStatus: "not_submitted",
  }).returning();

  if (!user) {
    res.status(500).json({ error: "Server error", message: "Failed to create user" });
    return;
  }

  req.session.userId = user.id;
  req.session.userRole = user.role;

  await logAudit(req, "user_register", "user", String(user.id));

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      kycStatus: user.kycStatus,
      isAgeVerified: user.isAgeVerified,
      createdAt: user.createdAt,
    },
    token: "session",
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials", message: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials", message: "Invalid email or password" });
    return;
  }

  req.session.userId = user.id;
  req.session.userRole = user.role;

  await logAudit(req, "user_login", "user", String(user.id));

  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      kycStatus: user.kycStatus,
      isAgeVerified: user.isAgeVerified,
      createdAt: user.createdAt,
    },
    token: "session",
  });
});

router.post("/auth/logout", requireAuth, async (req, res) => {
  await logAudit(req, "user_logout", "user", String(req.session.userId));
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
  if (!user) {
    res.status(404).json({ error: "Not found", message: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    kycStatus: user.kycStatus,
    isAgeVerified: user.isAgeVerified,
    createdAt: user.createdAt,
  });
});

export default router;
