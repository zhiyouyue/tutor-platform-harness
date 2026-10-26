import CertificationDossier from "./certification/CertificationDossier";
import CertificationQueue from "./certification/CertificationQueue";
import { useCertificationReview } from "./certification/useCertificationReview";
import "./certification/certifications.css";

export default function Certifications() {
  const review = useCertificationReview();

  return (
    <div className="cert-page">
      <div>
        <div className="cert-title">专家认证审核</div>
        <div className="cert-sub">先看资料完整度、经历和辅导能力，再决定通过或拒绝。</div>
      </div>

      {review.error && <div className="cert-error">{review.error}</div>}

      {review.loading ? (
        <div className="cert-loading">加载中…</div>
      ) : review.items.length === 0 ? (
        <div className="cert-empty">暂无待审核申请</div>
      ) : (
        <div className="cert-workspace">
          <CertificationQueue items={review.items} selectedId={review.selected?.id ?? null} onSelect={review.select} />
          {review.selected && (
            <CertificationDossier
              item={review.selected}
              dicts={review.dicts}
              reason={review.reason}
              busy={review.busy}
              onReason={review.setReason}
              onApprove={review.approve}
              onReject={review.reject}
            />
          )}
        </div>
      )}
    </div>
  );
}
