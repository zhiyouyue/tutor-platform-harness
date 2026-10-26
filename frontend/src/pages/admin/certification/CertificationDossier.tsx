import type { DictItem, PendingCertification } from "../../../services/api";
import {
  avatarText,
  capabilityGroups,
  displayName,
  formatRange,
  formatSubmitted,
  reviewChecks,
  showText,
} from "./reviewModel";

interface Props {
  item: PendingCertification;
  dicts: {
    serviceAudiences: DictItem[];
    coachingTypes: DictItem[];
    industries: DictItem[];
    jobRoles: DictItem[];
  };
  reason: string;
  busy: boolean;
  onReason: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}

export default function CertificationDossier({ item, dicts, reason, busy, onReason, onApprove, onReject }: Props) {
  const name = displayName(item);
  const role = [item.currentTitle, item.currentCompany, item.city].filter(Boolean).join(" · ") || "未填写职位、公司或城市";
  const checks = reviewChecks(item);
  const filled = checks.filter((check) => check.filled).length;
  const facts = [
    ["姓名", item.realName],
    ["账号", item.account],
    ["手机号", item.phone],
    ["所在城市", item.city],
    ["当前公司", item.currentCompany],
    ["当前职位", item.currentTitle],
  ] as const;
  const bio = showText(item.bio);

  return (
    <div className="cert-detail">
      <section className="cert-hero">
        <div className="cert-hero-bar" />
        <div className="cert-hero-body">
          <div className="cert-avatar cert-hero-avatar">{avatarText(name)}</div>
          <div>
            <div className="cert-hero-name">{name}</div>
            <div className="cert-hero-role">{role}</div>
            <div className="cert-hero-time">
              账号 {item.account || "—"} · 手机 {item.phone || "未填写"} · 提交于 {formatSubmitted(item.submittedAt)}
            </div>
          </div>
          <div className="cert-status">待审核</div>
        </div>
      </section>

      <div className="cert-split">
        <div className="cert-col">
          <section className="cert-card">
            <h3>基础信息</h3>
            <div className="cert-facts">
              {facts.map(([label, value]) => {
                const shown = showText(value);
                return (
                  <div key={label} className="cert-fact">
                    <b>{label}</b>
                    <span className={shown.empty ? "is-empty" : ""}>{shown.text}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="cert-card">
            <h3>个人简介</h3>
            <div className={`cert-bio${bio.empty ? " is-empty" : ""}`}>{bio.text}</div>
          </section>

          <section className="cert-card">
            <h3>工作经历</h3>
            {item.workExperience.length === 0 ? (
              <div className="cert-bio is-empty">未填写</div>
            ) : (
              item.workExperience.map((job) => (
                <div key={`${job.company}-${job.title}-${job.startDate}`} className="cert-job">
                  <div className="cert-dot" />
                  <div>
                    <div className="cert-job-title">{job.title} · {job.company}</div>
                    <div className="cert-job-sub">{formatRange(job)}</div>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>

        <div className="cert-side">
          <section className="cert-card">
            <h3>资料完整度</h3>
            <div className="cert-meter">
              <span>可据此判断是否通过</span>
              <strong>{filled} / {checks.length}</strong>
            </div>
            <div className="cert-track">
              <div className="cert-fill" style={{ width: `${(filled / checks.length) * 100}%` }} />
            </div>
            {checks.map((check) => (
              <div key={check.label} className="cert-check">
                <span className={`cert-mark${check.filled ? "" : " is-miss"}`}>{check.filled ? "✓" : "!"}</span>
                {check.label}
                <em>{check.detail}</em>
              </div>
            ))}
          </section>

          <section className="cert-card">
            <h3>辅导能力</h3>
            {capabilityGroups(item, dicts).map((group) => (
              <div key={group.title} className="cert-group">
                <p>{group.title}</p>
                <div className="cert-chips">
                  {group.labels.length === 0 ? (
                    <span className="cert-chip is-empty">未选择</span>
                  ) : (
                    group.labels.map((label) => <span key={label} className="cert-chip">{label}</span>)
                  )}
                </div>
              </div>
            ))}
          </section>

          <section className="cert-card">
            <h3>审核决定</h3>
            <p className="cert-hint">拒绝时必须写原因，导师端会看到。</p>
            <textarea
              className="cert-reason"
              value={reason}
              placeholder="拒绝时填写原因，导师可以看到"
              onChange={(event) => onReason(event.target.value)}
            />
            <div className="cert-actions">
              <button type="button" className="ant-btn cert-reject" disabled={busy || !reason.trim()} onClick={onReject}>
                拒绝
              </button>
              <button type="button" className="ant-btn ant-btn-primary" disabled={busy} onClick={onApprove}>
                通过认证
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
