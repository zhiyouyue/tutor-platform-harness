import { useEffect, useState } from "react";
import { fetchHealth } from "@/services/api";

export default function App() {
  const [status, setStatus] = useState<string>("loading...");

  useEffect(() => {
    fetchHealth()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  return (
    <main className="app">
      <h1>Harness App</h1>
      <p>
        Backend status: <strong>{status}</strong>
      </p>
    </main>
  );
}
