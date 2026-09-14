import { useState } from "react";
import SupervisorLayout, { type SupervisorPage } from "./SupervisorLayout";
import SupervisorDashboard from "./Dashboard";
import Students from "./Students";
import SupervisorProjects from "./Projects";
import ScheduleManagement from "./ScheduleManagement";

interface Props {
  onBack: () => void;
}

export default function SupervisorApp({ onBack }: Props) {
  const [page, setPage] = useState<SupervisorPage>("dashboard");

  return (
    <SupervisorLayout page={page} onNavigate={setPage} onBack={onBack}>
      {page === "dashboard" && <SupervisorDashboard onNavigate={setPage} />}
      {page === "students" && <Students />}
      {page === "projects" && <SupervisorProjects />}
      {page === "schedule" && <ScheduleManagement />}
    </SupervisorLayout>
  );
}
