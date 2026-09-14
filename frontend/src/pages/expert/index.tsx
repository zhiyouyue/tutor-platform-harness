import { useState } from "react";
import ExpertLayout, { type ExpertPage } from "./ExpertLayout";
import Dashboard from "./Dashboard";
import Projects from "./Projects";
import ProjectDetail from "./ProjectDetail";
import DeliverySpace from "./DeliverySpace";
import Capabilities from "./Capabilities";
import Schedule from "./Schedule";
import Income from "./Income";
import Profile from "./Profile";

interface Props {
  onBack: () => void;
}

export default function ExpertApp({ onBack }: Props) {
  const [page, setPage] = useState<ExpertPage>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const navigate = (p: string) => {
    setPage(p as ExpertPage);
    if (p !== "projects") setSelectedProjectId(null);
  };

  return (
    <ExpertLayout page={page} onNavigate={navigate} onBack={onBack}>
      {page === "dashboard" && <Dashboard onNavigate={navigate} />}
      {page === "projects" && !selectedProjectId && (
        <Projects onSelectProject={(id) => setSelectedProjectId(id)} />
      )}
      {page === "projects" && selectedProjectId && (
        <ProjectDetail
          projectId={selectedProjectId}
          onBack={() => setSelectedProjectId(null)}
          onOpenDelivery={() => setPage("delivery")}
        />
      )}
      {page === "delivery" && <DeliverySpace projectId={selectedProjectId} />}
      {page === "capabilities" && <Capabilities />}
      {page === "schedule" && <Schedule />}
      {page === "income" && <Income />}
      {page === "profile" && <Profile />}
    </ExpertLayout>
  );
}
