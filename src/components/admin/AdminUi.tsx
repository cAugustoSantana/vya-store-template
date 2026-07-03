import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export const adminInputClass =
  "block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500";

export const adminSelectClass = adminInputClass;

export const adminTextareaClass = `${adminInputClass} min-h-[5rem] resize-y`;

export const adminLabelClass =
  "mb-2 block text-sm font-bold uppercase tracking-wider text-gray-900";

export function AdminBackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-brand-600"
    >
      <ArrowLeft
        size={16}
        weight="bold"
        className="transition-transform group-hover:-translate-x-1"
        aria-hidden
      />
      {children}
    </Link>
  );
}

export function AdminPageHeader({
  title,
  subtitle,
  action,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  actions?: ReactNode;
}) {
  const headerAction = action ?? actions;
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 lg:text-3xl">{title}</h1>
        {subtitle ? <div className="mt-1 text-sm text-gray-500">{subtitle}</div> : null}
      </div>
      {headerAction ? <div className="w-full shrink-0 sm:w-auto">{headerAction}</div> : null}
    </header>
  );
}

export function AdminCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {title ? <h2 className="mb-4 text-base font-bold text-gray-900">{title}</h2> : null}
      {children}
    </section>
  );
}

export function AdminField({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label htmlFor={htmlFor} className={adminLabelClass}>
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export function AdminInput({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const input = (
    <input {...props} className={`${adminInputClass} ${className}`} />
  );
  if (!label) return input;
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {input}
    </label>
  );
}

export function AdminSelect({
  label,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const select = (
    <select {...props} className={`${adminSelectClass} ${className}`}>
      {children}
    </select>
  );
  if (!label) return select;
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {select}
    </label>
  );
}

export function AdminTextarea({
  label,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const textarea = (
    <textarea {...props} className={`${adminTextareaClass} ${className}`} />
  );
  if (!label) return textarea;
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {textarea}
    </label>
  );
}

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
};

export function AdminButton({ variant = "primary", className = "", ...props }: AdminButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60";
  const variants = {
    primary:
      "bg-brand-600 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 active:scale-[0.98]",
    secondary: "border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
    ghost: "px-0 py-0 text-brand-600 shadow-none hover:text-brand-700 hover:underline",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
  };
  return (
    <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

export function AdminLinkButton({
  to,
  children,
  variant = "primary",
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const variants = {
    primary:
      "bg-brand-600 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 active:scale-[0.98]",
    secondary: "border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50",
  };
  return (
    <Link
      to={to}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all sm:w-auto ${variants[variant]}`}
    >
      {children}
    </Link>
  );
}

export function AdminTable({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm md:block ${className}`}
    >
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function AdminMobileList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-3 md:hidden ${className}`}>{children}</div>;
}

export function AdminMobileCard({
  children,
  className = "",
  to,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  to?: string;
  onClick?: () => void;
}) {
  const cardClass = `block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50/80 active:bg-gray-50 ${className}`;

  if (to) {
    return (
      <Link to={to} className={cardClass} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <div className={cardClass} onClick={onClick} role={onClick ? "button" : undefined}>
      {children}
    </div>
  );
}

export const adminThClass =
  "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500";

export const adminTdClass = "px-4 py-3.5 align-top text-gray-900";

export const adminTrClass = "border-b border-gray-100 last:border-0 hover:bg-gray-50/60";

export function AdminEmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
      {children}
    </p>
  );
}

export const AdminEmpty = AdminEmptyState;

export function AdminTwoCol({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

export function AdminError({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-red-600">{children}</p>;
}

export function AdminSuccess({
  children,
  message,
  onDismiss,
  autoDismissMs = 5000,
}: {
  children?: ReactNode;
  message?: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!autoDismissMs || !onDismiss) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [message, autoDismissMs, onDismiss]);

  if (message && !visible) return null;

  const content = message ?? children;
  if (!content) return null;

  return (
    <div
      className="mb-4 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800"
      role="status"
    >
      <CheckCircle size={18} weight="fill" aria-hidden />
      {content}
    </div>
  );
}

export function AdminDetailList({ children }: { children: ReactNode }) {
  return <dl className="flex flex-col gap-4">{children}</dl>;
}

export function AdminDetailItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-900">{children}</dd>
    </div>
  );
}
