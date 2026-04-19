import { doc, getDoc, setDoc } from "firebase/firestore";
import type { AppUser, AppUserRole } from "../types";
import { db } from "./firebase";

export type RegisterableRole = Exclude<AppUserRole, "admin">;

type UserProfileDocument = {
  uid?: string;
  email?: string;
  role?: AppUserRole;
  fullName?: string;
  name?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CreateAppUserProfileInput = {
  uid: string;
  email: string;
  name: string;
  role: RegisterableRole;
};

const roleAvatars: Record<AppUserRole, string> = {
  admin: "🛡️",
  teacher: "👩‍🏫",
  student: "👨‍🎓",
};

function isAppUserRole(value: unknown): value is AppUserRole {
  return value === "admin" || value === "teacher" || value === "student";
}

function resolveDisplayName(data: UserProfileDocument, fallbackEmail?: string | null) {
  const candidates = [data.fullName, data.name, fallbackEmail?.split("@")[0], "Người dùng"];
  return candidates.find((value) => typeof value === "string" && value.trim())?.trim() ?? "Người dùng";
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function resolveAvatarForRole(role: AppUserRole) {
  return roleAvatars[role];
}

export function resolveHomeRouteForRole(role: AppUserRole) {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/dashboard";
}

export async function getAppUserProfile(uid: string, fallbackEmail?: string | null): Promise<AppUser | null> {
  if (!db) return null;

  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as UserProfileDocument & { teacherId?: string | null };
  const role = isAppUserRole(data.role) ? data.role : "student";

  return {
    id: uid,
    name: resolveDisplayName(data, fallbackEmail),
    avatar:
      typeof data.avatar === "string" && data.avatar.trim()
        ? data.avatar.trim()
        : resolveAvatarForRole(role),
    role,
    teacherId: data.teacherId ?? null,
  };
}

export async function waitForAppUserProfile(
  uid: string,
  fallbackEmail?: string | null,
  attempts = 4,
): Promise<AppUser | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const profile = await getAppUserProfile(uid, fallbackEmail);
    if (profile) return profile;

    if (attempt < attempts - 1) {
      await sleep(250 * (attempt + 1));
    }
  }

  return null;
}

export async function createAppUserProfile({ uid, email, name, role }: CreateAppUserProfileInput): Promise<AppUser> {
  if (!db) {
    throw new Error("Firestore chưa sẵn sàng. Hãy kiểm tra cấu hình Firebase Web.");
  }

  const trimmedName = name.trim() || email.split("@")[0] || "Người dùng";
  const avatar = resolveAvatarForRole(role);
  const timestamp = new Date().toISOString();
  const teacherId = role === "teacher" ? uid : null;

  await setDoc(
    doc(db, "users", uid),
    {
      uid,
      email,
      role,
      name: trimmedName,
      fullName: trimmedName,
      avatar,
      teacherId,
      createdAt: timestamp,
      updatedAt: timestamp,
    } satisfies UserProfileDocument & { teacherId: string | null },
    { merge: true },
  );

  return {
    id: uid,
    name: trimmedName,
    avatar,
    role,
    teacherId,
  };
}