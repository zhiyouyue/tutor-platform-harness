export type DialogField = {
  key: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
  type?: "text" | "number";
  options?: Array<{ value: string; label: string }>;
};

export type DialogRequest =
  | {
      kind: "form";
      title: string;
      message?: string;
      fields: DialogField[];
      confirmText?: string;
      cancelText?: string;
      resolve: (value: Record<string, string> | null) => void;
    }
  | {
      kind: "alert";
      title?: string;
      message: string;
      confirmText?: string;
      resolve: () => void;
    };

type Listener = (req: DialogRequest | null) => void;

const listeners = new Set<Listener>();
let pending: DialogRequest | null = null;

function emit(req: DialogRequest | null) {
  pending = req;
  for (const listener of listeners) listener(req);
}

export function subscribeDialog(listener: Listener) {
  listeners.add(listener);
  if (pending) listener(pending);
  return () => {
    listeners.delete(listener);
  };
}

export function closeDialog() {
  emit(null);
}

/** 站内表单弹窗，替代 window.prompt；取消返回 null */
export function askForm(options: {
  title: string;
  message?: string;
  fields: DialogField[];
  confirmText?: string;
  cancelText?: string;
}): Promise<Record<string, string> | null> {
  return new Promise((resolve) => {
    emit({
      kind: "form",
      title: options.title,
      message: options.message,
      fields: options.fields,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      resolve,
    });
  });
}

/** 单行/多行输入，替代 window.prompt */
export async function askText(options: {
  title: string;
  message?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
  confirmText?: string;
}): Promise<string | null> {
  const result = await askForm({
    title: options.title,
    message: options.message,
    confirmText: options.confirmText,
    fields: [
      {
        key: "value",
        label: options.label || options.title,
        placeholder: options.placeholder,
        defaultValue: options.defaultValue,
        required: options.required,
        multiline: options.multiline,
      },
    ],
  });
  if (!result) return null;
  return result.value ?? "";
}

/** 站内提示，替代 window.alert */
export function notify(message: string, title = "提示"): Promise<void> {
  return new Promise((resolve) => {
    emit({
      kind: "alert",
      title,
      message,
      resolve,
    });
  });
}
