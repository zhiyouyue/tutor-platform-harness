import { useState } from "react";
import OpsLayout, { type OpsPage } from "./OpsLayout";
import OpsDashboard from "./Dashboard";
import Students from "./Students";
import OpsProjects from "./Projects";
import ScheduleManagement from "./ScheduleManagement";
import OpsFinance from "./Finance";

interface Props {
  onBack: () => void;
}

export default function OpsApp({ onBack }: Props) {
  const [page, setPage] = useState<OpsPage>("dashboard");
  const [pendingProject, setPendingProject] = useState<{ projectId: number; focusIso?: string; token: number } | null>(null);

  return (
    <OpsLayout page={page} onNavigate={setPage} onBack={onBack}>
      {page === "dashboard" && <OpsDashboard onNavigate={setPage} />}
      {page === "students" && <Students />}
      {page === "projects" && <OpsProjects pending={pendingProject} />}
      {page === "schedule" && (
        <ScheduleManagement
          onReschedule={(projectId, focusIso) => {
            setPendingProject({ projectId, focusIso, token: Date.now() });
            setPage("projects");
          }}
        />
      )}
      {page === "finance" && <OpsFinance />}
    </OpsLayout>
  );
}
