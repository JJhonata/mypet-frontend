import { ButtonHTMLAttributes, ReactNode } from "react";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

export function AnimatedButton({ 
  children, 
  variant = "primary", 
  loading = false,
  className = "",
  disabled,
  ...props 
}: AnimatedButtonProps) {
  const baseClasses = "px-6 py-3 rounded-lg font-medium transition-all duration-200 active:scale-[0.98]";
  const variantClasses = {
    primary: "bg-emerald-700 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg",
    secondary: "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        loading ? 'opacity-75 cursor-not-allowed' : ''
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
