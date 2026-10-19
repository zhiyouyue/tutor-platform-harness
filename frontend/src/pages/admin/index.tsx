import { useState } from "react";
import AdminLayout, { type AdminPage } from "./AdminLayout";
import Certifications from "./Certifications";
import ExpertProjectBoard from "./ExpertProjectBoard";

interface Props {
  onBack: () => void;
}

export default function AdminApp({ onBack }: Props) {
  const [page, setPage] = useState<AdminPage>("certifications");

  return (
    <AdminLayout page={page} onNavigate={setPage} onBack={onBack}>
      {page === "certifications" && <Certifications />}
      {page === "expertBoard" && <ExpertProjectBoard />}
    </AdminLayout>
  );
}
