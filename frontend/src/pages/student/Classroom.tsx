import AppointmentClassroom from "../../components/AppointmentClassroom";

interface Props {
  appointmentId: number;
  onBack: () => void;
}

export default function StudentClassroom({ appointmentId, onBack }: Props) {
  return <AppointmentClassroom appointmentId={appointmentId} onBack={onBack} />;
}
