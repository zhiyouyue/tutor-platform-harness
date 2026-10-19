import { AppError } from "../errors/AppError.js";
import * as incomeRepo from "../repositories/incomeRepository.js";
import * as projectRepo from "../repositories/projectRepository.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";

/** 项目总价按课次数拆分（分），最后一课次补余数 — PO Q-P2-06 方案 A */
export function splitProjectTotalCents(totalAmount: number, sessionCount: number): number[] {
  if (sessionCount <= 0) throw new AppError("项目课次数为 0，无法拆分入账", 400);
  const totalCents = Math.round(totalAmount * 100);
  const base = Math.floor(totalCents / sessionCount);
  const amounts: number[] = [];
  for (let i = 0; i < sessionCount - 1; i++) amounts.push(base);
  amounts.push(totalCents - base * (sessionCount - 1));
  return amounts;
}

export async function accrueIncomeForConfirmedAppointment(appointmentId: number): Promise<void> {
  const appt = await scheduleRepo.findAppointmentById(appointmentId);
  if (!appt) throw new AppError("课次不存在", 404);

  if (await incomeRepo.existsForAppointment(appointmentId)) return;

  const project = await projectRepo.findProjectById(appt.project_id);
  if (!project?.expert_id) throw new AppError("项目未分配专家，无法入账", 400);

  const sessionIds = await scheduleRepo.listActiveAppointmentIdsForProject(appt.project_id);
  const index = sessionIds.indexOf(appointmentId);
  if (index < 0) throw new AppError("课次不在项目课次列表中", 400);

  const total = parseFloat(project.total_amount);
  const centsParts = splitProjectTotalCents(total, sessionIds.length);
  const amount = centsParts[index]! / 100;

  const topic = appt.topic || "辅导课次";
  await incomeRepo.insertLine({
    expertId: project.expert_id,
    projectId: project.id,
    appointmentId,
    amount,
    description: `${project.title} · ${topic}`,
  });
}

export async function projectUsesSessionIncome(projectId: number): Promise<boolean> {
  const n = await scheduleRepo.countActiveAppointmentsForProject(projectId);
  return n > 0;
}
