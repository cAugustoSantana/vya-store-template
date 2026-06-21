import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { CheckCircle } from "@phosphor-icons/react";

type ClassProps = { className?: string };

export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
      {title && <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">{title}</h2>}
      {children}
    </section>
  );
}

export function AdminButton({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60";
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-gray-600 hover:bg-gray-100",
  };
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function AdminInput({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <input
        className={`block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${className}`}
        {...props}
      />
    </label>
  );
}

export function AdminTextarea({
  label,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <textarea
        className={`block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${className}`}
        {...props}
      />
    </label>
  );
}

export function AdminSelect({
  label,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <select
        className={`block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function AdminSuccess({
  message,
  onDismiss,
  autoDismissMs = 5000,
}: {
  message: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!autoDismissMs) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [message, autoDismissMs, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
    >
      <CheckCircle size={18} weight="fill" aria-hidden />
      {message}
    </div>
  );
}

export function AdminTable({ children, className = "" }: { children: ReactNode } & ClassProps) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 text-sm">{children}</table>
    </div>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
      {children}
    </p>
  );
}
