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

  return (
    <OpsLayout page={page} onNavigate={setPage} onBack={onBack}>
      {page === "dashboard" && <OpsDashboard onNavigate={setPage} />}
      {page === "students" && <Students />}
      {page === "projects" && <OpsProjects />}
      {page === "schedule" && <ScheduleManagement />}
      {page === "finance" && <OpsFinance />}
    </OpsLayout>
  );
}
