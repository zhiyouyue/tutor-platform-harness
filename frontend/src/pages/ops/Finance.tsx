import { useEffect, useState } from "react";
import { fetchOpsFinanceSummary } from "../../services/api";
import { SimpleCard, SimpleScreen } from "../../components/SimpleScreen";

export default function OpsFinance() {
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpsFinanceSummary().then((res) => {
      if (res.success) {
        setTotal(res.data.totalAmount);
        setCount(res.data.projectCount);
      }
      setLoading(false);
    });
  }, []);

  return (
    <SimpleScreen title="收入概览" subtitle="项目签约金额汇总">
      {loading ? (
        <p style={{ color: "var(--c-text-3)" }}>加载中…</p>
      ) : (
        <>
          <SimpleCard>
            <div style={{ fontSize: 13, color: "var(--c-text-3)" }}>项目总额</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>¥{total.toLocaleString()}</div>
            <div style={{ fontSize: 14, color: "var(--c-text-2)", marginTop: 8 }}>共 {count} 个项目</div>
          </SimpleCard>
        </>
      )}
    </SimpleScreen>
  );
}
