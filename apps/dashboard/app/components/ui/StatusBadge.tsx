import { Badge } from "~/components/ui/Badge";
import { STATUS_LABELS } from "~/lib/utils";
import type { UserStatus } from "~/types";

interface StatusBadgeProps {
  status: UserStatus;
}

const statusVariant: Record<
  UserStatus,
  "success" | "warning" | "danger" | "gray" | "info"
> = {
  active: "success",
  pending_activation: "warning",
  pending_email: "info",
  suspended: "gray",
  banned: "danger",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]}>{STATUS_LABELS[status]}</Badge>
  );
}
