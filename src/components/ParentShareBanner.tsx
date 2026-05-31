import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { getParentShareState } from "@/lib/parent.functions";

export function ParentShareBanner() {
  const fetchState = useServerFn(getParentShareState);
  const { data } = useQuery({
    queryKey: ["parent-share-state"],
    queryFn: () => fetchState(),
    staleTime: 5 * 60_000,
  });

  const link = data?.link;
  if (!link || link.paused) return null;

  return (
    <Link
      to="/settings"
      className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card hover:bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors"
    >
      <Users className="h-3.5 w-3.5" />
      Sharing weekly status with{" "}
      <span className="text-foreground font-medium">
        {link.parent_name || link.parent_email}
      </span>
      <span className="text-muted-foreground/70">· manage</span>
    </Link>
  );
}
