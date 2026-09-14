import { AppError } from "../errors/AppError.js";
import * as expertRepo from "../repositories/expertRepository.js";
import * as projectRepo from "../repositories/projectRepository.js";
import * as studentRepo from "../repositories/studentRepository.js";

export async function requireProjectAccess(
  projectId: number,
  userId: number,
  role: string,
): Promise<Awaited<ReturnType<typeof projectRepo.findProjectById>>> {
  const project = await projectRepo.findProjectById(projectId);
  if (!project) throw new AppError("项目不存在", 404);

  if (role === "admin") return project;
  if (role === "ops" && project.ops_user_id === userId) return project;

  if (role === "expert") {
    const profile = await expertRepo.findByUserId(userId);
    if (profile && project.expert_id === profile.id) return project;
  }

  if (role === "student") {
    const sp = await studentRepo.findStudentByUserId(userId);
    if (sp && project.student_id === sp.id) return project;
  }

  throw new AppError("无权访问此项目", 403);
}

export async function requireExpertProfile(userId: number) {
  const profile = await expertRepo.findByUserId(userId);
  if (!profile) throw new AppError("专家档案不存在", 404);
  return profile;
}
