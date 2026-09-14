import { useState } from "react";
import StudentLayout, { type StudentPage } from "./StudentLayout";
import StudentDashboard from "./Dashboard";
import MyProject from "./MyProject";
import StudentSchedule from "./Schedule";
import StudentMessages from "./Messages";
import StudentProfile from "./Profile";
import DeliverySpace from "../mentor/DeliverySpace";

interface Props {
  onBack: () => void;
}

export default function StudentApp({ onBack }: Props) {
  const [page, setPage] = useState<StudentPage>("dashboard");
  const [deliveryProjectId, setDeliveryProjectId] = useState<number | null>(null);

  return (
    <StudentLayout page={page} onNavigate={setPage} onBack={onBack}>
      {page === "dashboard" && <StudentDashboard onNavigate={setPage} />}
      {page === "project" && !deliveryProjectId && (
        <MyProject onOpenDelivery={(id) => { setDeliveryProjectId(id); setPage("project"); }} />
      )}
      {page === "project" && deliveryProjectId && (
        <DeliverySpace projectId={String(deliveryProjectId)} />
      )}
      {page === "schedule" && <StudentSchedule />}
      {page === "messages" && <StudentMessages />}
      {page === "profile" && <StudentProfile />}
    </StudentLayout>
  );
}
