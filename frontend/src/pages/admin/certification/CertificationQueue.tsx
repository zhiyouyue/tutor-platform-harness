import type { PendingCertification } from "../../../services/api";
import { avatarText, displayName, formatSubmitted, missingCount } from "./reviewModel";

interface Props {
  items: PendingCertification[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function CertificationQueue({ items, selectedId, onSelect }: Props) {
  return (
    <aside className="cert-queue">
      <div className="cert-queue-head">
        待审核
        <span className="cert-count">{items.length}</span>
      </div>
      <div className="cert-queue-list">
        {items.map((item) => {
          const name = displayName(item);
          const missing = missingCount(item);
          const place = [item.currentTitle, item.city].filter(Boolean).join(" · ");
          return (
            <button
              key={item.id}
              type="button"
              className={`cert-queue-item${item.id === selectedId ? " is-active" : ""}`}
              onClick={() => onSelect(item.id)}
            >
              <span className={`cert-avatar${item.id !== selectedId && missing > 0 ? " is-muted" : ""}`}>{avatarText(name)}</span>
              <span>
                <span className="cert-q-name">{name}</span>
                <span className="cert-q-meta">{place || item.account || "未填写职位"}</span>
                <span className="cert-q-time">提交于 {formatSubmitted(item.submittedAt)}</span>
                {missing > 0 && <span className="cert-miss">缺 {missing} 项</span>}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
