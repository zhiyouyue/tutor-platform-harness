import * as expertRepo from "../repositories/expertRepository.js";
import * as incomeRepo from "../repositories/incomeRepository.js";
import * as projectRepo from "../repositories/projectRepository.js";
import * as scheduleRepo from "../repositories/scheduleRepository.js";
import * as studentRepo from "../repositories/studentRepository.js";
import { AppError } from "../errors/AppError.js";
import { formatProject } from "../utils/routeHelpers.js";

function formatAppointment(row: scheduleRepo.AppointmentDetailRow) {
  return {
    id: row.id,
    projectId: row.project_id,
    projectTitle: row.project_title,
    studentName: row.student_name,
    expertName: row.expert_name,
    startAt: row.start_at,
    endAt: row.end_at,
    topic: row.topic,
    status: row.status,
  };
}

export async function getExpertDashboard(userId: number) {
  const ep = await expertRepo.findByUserId(userId);
  if (!ep) throw new AppError("专家档案不存在", 404);

  const projects = await projectRepo.listProjects({ expertId: ep.id });
  const pendingConfirm = projects.filter((p) => p.status === "pending_confirm");
  const inProgress = projects.filter((p) =>
    ["in_progress", "pending_completion_review"].includes(p.status),
  );
  const completed = projects.filter((p) => p.status === "completed");

  const income = await incomeRepo.getSummary(ep.id);
  const [todayAppointments, upcomingAppointments] = await Promise.all([
    scheduleRepo.listTodayAppointmentsForExpert(ep.id),
    scheduleRepo.listUpcomingForExpert(ep.id, 10),
  ]);

  return {
    profile: {
      realName: ep.real_name,
      acceptingProjects: ep.accepting_projects === 1,
      profileStatus: ep.profile_status,
    },
    stats: {
      pendingConfirm: pendingConfirm.length,
      inProgress: inProgress.length,
      completed: completed.length,
      uniqueStudents: new Set(projects.map((p) => p.student_id)).size,
    },
    pendingProjects: pendingConfirm.slice(0, 3).map(formatProject),
    todayAppointments: todayAppointments.map(formatAppointment),
    upcomingAppointments: upcomingAppointments.map(formatAppointment),
    income: {
      total: parseFloat(income.total),
      pending: parseFloat(income.pending),
      settled: parseFloat(income.settled),
    },
  };
}

export async function getOpsDashboard() {
  const [projects, students, appointments, expertSummaries] = await Promise.all([
    projectRepo.listProjects({}),
    studentRepo.listStudents(),
    scheduleRepo.listAllAppointments(50),
    scheduleRepo.listExpertAvailabilitySummary(),
  ]);

  const active = projects.filter((p) =>
    ["in_progress", "pending_confirm", "pending_completion_review", "published"].includes(p.status),
  );
  const pendingReview = projects.filter((p) => p.status === "pending_completion_review");
  const thisWeekAppointments = appointments.filter((a) => {
    const start = new Date(a.start_at);
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    return start >= now && start <= weekEnd;
  });

  return {
    stats: {
      totalStudents: students.length,
      activeProjects: active.length,
      pendingCompletionReview: pendingReview.length,
      weekAppointments: thisWeekAppointments.length,
    },
    recentProjects: projects.slice(0, 8).map(formatProject),
    appointments: appointments.slice(0, 20).map(formatAppointment),
    expertAvailability: expertSummaries.map((e) => ({
      expertId: e.expert_id,
      realName: e.real_name,
      slotCount: e.slot_count,
      acceptingProjects: e.accepting_projects === 1,
    })),
  };
}
