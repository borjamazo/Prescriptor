import { cn, getInitials } from "~/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const colors = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-purple-500",
  "bg-cyan-500",
];

function getColorIndex(name: string | null | undefined): number {
  if (!name) return 0;
  return name.charCodeAt(0) % colors.length;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const colorClass = colors[getColorIndex(name)];

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "Avatar"}
        className={cn("rounded-full object-cover", sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-white font-medium select-none",
        sizeClass,
        colorClass,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
