import { AppError } from "../errors/AppError.js";
import * as projectRepo from "../repositories/projectRepository.js";
import { formatProject } from "../utils/routeHelpers.js";
import { notifyInApp } from "./notificationService.js";

export async function patchOpsProject(
  projectId: number,
  opsUserId: number,
  patch: { expertId?: number | null; title?: string; totalAmount?: number },
) {
  const project = await projectRepo.findProjectById(projectId);
  if (!project) throw new AppError("项目不存在", 404);
  if (project.ops_user_id !== opsUserId) throw new AppError("无权操作该项目", 403);

  const prevExpertId = project.expert_id;
  await projectRepo.updateProjectAssignment(projectId, patch);
  const updated = await projectRepo.findProjectById(projectId);
  if (!updated) throw new AppError("项目不存在", 404);

  if (patch.expertId !== undefined && patch.expertId !== prevExpertId) {
    const stakeholders = await projectRepo.getProjectStakeholderUserIds(projectId);
    const title = "项目专家已调整";
    const body = `项目「${updated.title}」已改派专家，请关注后续课次安排。`;
    if (stakeholders.expertUserId) {
      await notifyInApp({ userId: stakeholders.expertUserId, title, body, category: "project" });
    }
    if (patch.expertId) {
      const newExpertUserId = await projectRepo.getExpertUserId(patch.expertId);
      if (newExpertUserId) {
        await notifyInApp({
          userId: newExpertUserId,
          title: "新项目指派",
          body: `您已被指派参与项目「${updated.title}」。`,
          category: "project",
        });
      }
    }
    if (stakeholders.studentUserId) {
      await notifyInApp({
        userId: stakeholders.studentUserId,
        title,
        body: `您的项目「${updated.title}」专家已更新。`,
        category: "project",
      });
    }
  }

  return formatProject(updated);
}
