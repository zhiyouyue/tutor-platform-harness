import { useState } from "react";
import StudentLayout, { type StudentPage } from "./StudentLayout";
import StudentDashboard from "./Dashboard";
import MyProject from "./MyProject";
import StudentSchedule from "./Schedule";
import StudentProfile from "./Profile";
import StudentClassroom from "./Classroom";
import DeliverySpace from "../expert/DeliverySpace";

interface Props {
  onBack: () => void;
}

export default function StudentApp({ onBack }: Props) {
  const [page, setPage] = useState<StudentPage>("dashboard");
  const [deliveryProjectId, setDeliveryProjectId] = useState<number | null>(null);
  const [classroomId, setClassroomId] = useState<number | null>(null);

  return (
    <StudentLayout page={page} onNavigate={setPage} onBack={onBack}>
      {page === "dashboard" && <StudentDashboard onNavigate={setPage} />}
      {page === "project" && !deliveryProjectId && (
        <MyProject onOpenDelivery={(id) => { setDeliveryProjectId(id); setPage("project"); }} />
      )}
      {page === "project" && deliveryProjectId && (
        <DeliverySpace projectId={String(deliveryProjectId)} />
      )}
      {page === "schedule" && !classroomId && (
        <StudentSchedule onEnterClassroom={(id) => setClassroomId(id)} />
      )}
      {page === "schedule" && classroomId && (
        <StudentClassroom appointmentId={classroomId} onBack={() => setClassroomId(null)} />
      )}
      {page === "profile" && <StudentProfile />}
    </StudentLayout>
  );
}
