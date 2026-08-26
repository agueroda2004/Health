import { cn } from "../utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800", className)} />
  );
}