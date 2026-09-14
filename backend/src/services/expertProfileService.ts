import { AppError } from "../errors/AppError.js";
import * as expertRepo from "../repositories/expertRepository.js";
import * as userRepo from "../repositories/userRepository.js";

function formatProfile(profile: expertRepo.ExpertProfileRow, user: userRepo.UserRow) {
  return {
    id: profile.id,
    userId: profile.user_id,
    account: user.account,
    phone: user.phone,
    realName: profile.real_name,
    city: profile.city,
    currentCompany: profile.current_company,
    currentTitle: profile.current_title,
    bio: profile.bio,
    education: profile.education_json,
    workExperience: profile.work_experience_json,
    profileStatus: profile.profile_status,
    acceptingProjects: profile.accepting_projects === 1,
    verifiedAt: profile.verified_at,
    rejectReason: profile.reject_reason,
  };
}

async function requireExpertProfile(userId: number) {
  const user = await userRepo.findById(userId);
  if (!user || user.role !== "expert") {
    throw new AppError("仅专家可访问", 403);
  }
  let profile = await expertRepo.findByUserId(userId);
  if (!profile) {
    profile = await expertRepo.createProfile(userId);
  }
  return { user, profile };
}

export async function getMyProfile(userId: number) {
  const { user, profile } = await requireExpertProfile(userId);
  return formatProfile(profile, user);
}

export async function updateMyProfile(
  userId: number,
  body: {
    realName?: string;
    city?: string;
    currentCompany?: string;
    currentTitle?: string;
    bio?: string;
    education?: unknown;
    workExperience?: unknown;
    acceptingProjects?: boolean;
  },
) {
  await requireExpertProfile(userId);
  const updated = await expertRepo.updateProfile(userId, {
    realName: body.realName,
    city: body.city,
    currentCompany: body.currentCompany,
    currentTitle: body.currentTitle,
    bio: body.bio,
    educationJson: body.education,
    workExperienceJson: body.workExperience,
    acceptingProjects: body.acceptingProjects,
  });
  if (!updated) throw new AppError("更新失败", 500);
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError("用户不存在", 404);
  return formatProfile(updated, user);
}

export async function getCertificationStatus(userId: number) {
  const { profile } = await requireExpertProfile(userId);
  return {
    profileStatus: profile.profile_status,
    verifiedAt: profile.verified_at,
    rejectReason: profile.reject_reason,
  };
}

export async function submitCertification(userId: number) {
  const { profile } = await requireExpertProfile(userId);
  if (!["draft", "rejected"].includes(profile.profile_status)) {
    throw new AppError("当前状态不可提交认证", 400);
  }
  const updated = await expertRepo.submitCertification(userId);
  if (!updated) throw new AppError("提交失败", 500);
  return {
    profileStatus: updated.profile_status,
    submittedAt: updated.updated_at,
  };
}

export async function listPendingCertifications() {
  const rows = await expertRepo.listPendingCertifications();
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    account: r.account,
    phone: r.phone,
    realName: r.real_name,
    city: r.city,
    currentCompany: r.current_company,
    currentTitle: r.current_title,
    profileStatus: r.profile_status,
    submittedAt: r.updated_at,
  }));
}

export async function approveCertification(expertId: number, adminUserId: number) {
  const updated = await expertRepo.approveCertification(expertId, adminUserId);
  if (!updated) throw new AppError("专家不存在或状态不可审核", 404);
  return { id: updated.id, profileStatus: updated.profile_status, verifiedAt: updated.verified_at };
}

export async function rejectCertification(
  expertId: number,
  adminUserId: number,
  reason: string,
) {
  if (!reason?.trim()) throw new AppError("请填写拒绝原因", 400);
  const updated = await expertRepo.rejectCertification(expertId, adminUserId, reason.trim());
  if (!updated) throw new AppError("专家不存在或状态不可审核", 404);
  return { id: updated.id, profileStatus: updated.profile_status, rejectReason: updated.reject_reason };
}
