import toast from "react-hot-toast";
import { CheckCircle2, Info, XCircle } from "lucide-react";

const baseOptions = {
  duration: 2600,
  className:
    "!rounded-2xl !border !border-zinc-100 !bg-white !px-4 !py-3 !font-semibold !text-zinc-800 !shadow-xl dark:!border-zinc-700 dark:!bg-zinc-900 dark:!text-zinc-100",
} as const;

export const notify = {
  success: (message: string) =>
    toast(message, {
      ...baseOptions,
      icon: <CheckCircle2 className="h-5 w-5 text-primary-500" />,
    }),
  error: (message: string) =>
    toast(message, {
      ...baseOptions,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      duration: 4200,
    }),
  info: (message: string) =>
    toast(message, { ...baseOptions, icon: <Info className="h-5 w-5 text-sky-500" /> }),
};