import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/AppError.js";
import * as expertRepo from "../repositories/expertRepository.js";
import * as userRepo from "../repositories/userRepository.js";
import type { UserRow } from "../repositories/userRepository.js";

const SALT_ROUNDS = 10;

export interface AuthUserSummary {
  id: number;
  account: string | null;
  phone: string | null;
  role: string;
  status: string;
}

export interface LoginResult {
  token: string;
  user: AuthUserSummary;
  expertProfile?: ReturnType<typeof formatExpertProfile>;
}

function formatUser(user: UserRow): AuthUserSummary {
  return {
    id: user.id,
    account: user.account,
    phone: user.phone,
    role: user.role,
    status: user.status,
  };
}

function formatExpertProfile(profile: expertRepo.ExpertProfileRow) {
  return {
    id: profile.id,
    realName: profile.real_name,
    city: profile.city,
    currentCompany: profile.current_company,
    currentTitle: profile.current_title,
    bio: profile.bio,
    profileStatus: profile.profile_status,
    acceptingProjects: profile.accepting_projects === 1,
    verifiedAt: profile.verified_at,
    rejectReason: profile.reject_reason,
  };
}

export async function registerExpert(body: {
  account: string;
  password: string;
  phone?: string;
  realName?: string;
}): Promise<LoginResult> {
  const account = body.account.trim();
  const password = body.password;
  const phone = body.phone?.trim();

  if (!account || account.length < 3) {
    throw new AppError("账号至少 3 个字符", 400);
  }
  if (!password || password.length < 6) {
    throw new AppError("密码至少 6 位", 400);
  }
  if (await userRepo.accountExists(account)) {
    throw new AppError("账号已存在", 409);
  }
  if (phone && (await userRepo.phoneExists(phone))) {
    throw new AppError("手机号已注册", 409);
  }

  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  const user = await userRepo.createUser({
    account,
    phone: phone ?? null,
    passwordHash,
    role: "expert",
    status: "pending",
  });
  const profile = await expertRepo.createProfile(user.id, body.realName?.trim());

  return {
    token: "",
    user: formatUser(user),
    expertProfile: formatExpertProfile(profile),
  };
}

export async function login(
  app: FastifyInstance,
  body: { account: string; password: string },
): Promise<LoginResult> {
  const identifier = body.account.trim();
  const user = await userRepo.findByAccountOrPhone(identifier);
  if (!user || !user.password_hash) {
    throw new AppError("账号或密码错误", 401);
  }
  if (user.status === "suspended") {
    throw new AppError("账号已被禁用", 403);
  }
  if (!bcrypt.compareSync(body.password, user.password_hash)) {
    throw new AppError("账号或密码错误", 401);
  }

  const token = app.jwt.sign({
    userId: user.id,
    role: user.role,
    account: user.account ?? undefined,
  });

  let expertProfile;
  if (user.role === "expert") {
    const profile = await expertRepo.findByUserId(user.id);
    if (profile) expertProfile = formatExpertProfile(profile);
  }

  return { token, user: formatUser(user), expertProfile };
}

export async function getMe(userId: number) {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError("用户不存在", 404);

  const result: Record<string, unknown> = { user: formatUser(user) };

  if (user.role === "expert") {
    const profile = await expertRepo.findByUserId(userId);
    if (profile) result.expertProfile = formatExpertProfile(profile);
  }

  return result;
}

export function attachToken(app: FastifyInstance, user: UserRow): string {
  return app.jwt.sign({
    userId: user.id,
    role: user.role,
    account: user.account ?? undefined,
  });
}
