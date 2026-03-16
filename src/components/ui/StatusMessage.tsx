type StatusMessageProps = {
  type: "success" | "error" | "info";
  message: string;
};

const stylesByType: Record<StatusMessageProps["type"], string> = {
  success: "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300",
  error: "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300",
  info: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
};

export function StatusMessage({ type, message }: StatusMessageProps) {
  return (
    <div className={`border px-4 py-3 rounded-lg ${stylesByType[type]}`}>
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
}
