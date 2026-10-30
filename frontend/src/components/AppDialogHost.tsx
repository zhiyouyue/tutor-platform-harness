import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  closeDialog,
  subscribeDialog,
  type DialogField,
  type DialogRequest,
} from "./uiDialog";

export default function AppDialogHost() {
  const [req, setReq] = useState<DialogRequest | null>(null);
  useEffect(() => subscribeDialog(setReq), []);
  if (!req || typeof document === "undefined") return null;

  return createPortal(
    <DialogShell
      title={req.kind === "alert" ? req.title || "提示" : req.title}
      message={req.message}
      onBackdrop={() => {
        if (req.kind === "alert") {
          req.resolve();
          closeDialog();
        }
      }}
    >
      {req.kind === "alert" ? (
        <AlertBody
          confirmText={req.confirmText}
          onConfirm={() => {
            req.resolve();
            closeDialog();
          }}
        />
      ) : (
        <FormBody
          fields={req.fields}
          confirmText={req.confirmText}
          cancelText={req.cancelText}
          onCancel={() => {
            req.resolve(null);
            closeDialog();
          }}
          onSubmit={(values) => {
            req.resolve(values);
            closeDialog();
          }}
        />
      )}
    </DialogShell>,
    document.body,
  );
}

function DialogShell({
  title,
  message,
  onBackdrop,
  children,
}: {
  title: string;
  message?: string;
  onBackdrop: () => void;
  children: ReactNode;
}) {
  return (
    <div
      role="presentation"
      onClick={onBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(10, 37, 64, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--c-surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-elevated)",
          border: "1px solid var(--c-border)",
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 600, color: "var(--c-text-1)" }}>{title}</div>
        {message && (
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--c-text-2)", whiteSpace: "pre-wrap" }}>
            {message}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

function AlertBody({ confirmText, onConfirm }: { confirmText?: string; onConfirm: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <button type="button" className="ant-btn ant-btn-primary" onClick={onConfirm}>
        {confirmText || "知道了"}
      </button>
    </div>
  );
}

function FormBody({
  fields,
  confirmText,
  cancelText,
  onCancel,
  onSubmit,
}: {
  fields: DialogField[];
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const formId = useId();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.defaultValue ?? ""])),
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    for (const field of fields) {
      if (field.required && !values[field.key]?.trim()) return;
    }
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {fields.map((field) => {
        const id = `${formId}-${field.key}`;
        return (
          <label key={field.key} htmlFor={id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--c-text-3)" }}>
              {field.label}
              {field.required ? " *" : ""}
            </span>
            {field.options ? (
              <select
                id={id}
                className="ant-select"
                value={values[field.key]}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                required={field.required}
                style={{ width: "100%" }}
              >
                <option value="">{field.placeholder || "请选择"}</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.multiline ? (
              <textarea
                id={id}
                className="ant-input"
                rows={5}
                placeholder={field.placeholder}
                value={values[field.key]}
                required={field.required}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                style={{ width: "100%", resize: "vertical" }}
              />
            ) : (
              <input
                id={id}
                className="ant-input"
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={values[field.key]}
                required={field.required}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                style={{ width: "100%" }}
                autoFocus={fields[0]?.key === field.key}
              />
            )}
          </label>
        );
      })}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
        <button type="button" className="ant-btn ant-btn-default" onClick={onCancel}>
          {cancelText || "取消"}
        </button>
        <button type="submit" className="ant-btn ant-btn-primary">
          {confirmText || "确定"}
        </button>
      </div>
    </form>
  );
}
