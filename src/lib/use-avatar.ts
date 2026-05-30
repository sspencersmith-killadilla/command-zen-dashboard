import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  getMyAvatar,
  updateAvatarParts,
  equipItem,
  recordOnTimeCompletion,
  recordThemeArcComplete,
  DEFAULT_AVATAR_STATE,
  type AvatarState,
} from "./avatar.functions";
import { getCosmetic, type Slot } from "./cosmetics";

export const avatarQueryKey = ["avatar"] as const;

export function useAvatar() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(getMyAvatar);
  const updateFn = useServerFn(updateAvatarParts);
  const equipFn = useServerFn(equipItem);
  const onTimeFn = useServerFn(recordOnTimeCompletion);
  const masteryFn = useServerFn(recordThemeArcComplete);

  const q = useQuery({
    queryKey: avatarQueryKey,
    queryFn: () => fetchFn(),
    staleTime: 30_000,
  });

  const updateParts = useMutation({
    mutationFn: (patch: Partial<AvatarState>) => updateFn({ data: patch }),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: avatarQueryKey });
      const prev = qc.getQueryData<AvatarState>(avatarQueryKey);
      if (prev) qc.setQueryData<AvatarState>(avatarQueryKey, { ...prev, ...patch });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(avatarQueryKey, ctx.prev);
      toast.error("Could not save avatar");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: avatarQueryKey }),
  });

  const equip = useMutation({
    mutationFn: ({ slot, itemId }: { slot: Slot; itemId: string | null }) =>
      equipFn({ data: { slot, itemId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: avatarQueryKey }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't equip"),
  });

  const recordOnTime = useMutation({
    mutationFn: () => onTimeFn(),
    onSuccess: (res) => {
      if (res.newItems.length > 0) {
        qc.invalidateQueries({ queryKey: avatarQueryKey });
        for (const id of res.newItems) {
          const item = getCosmetic(id);
          if (item) toast.success(`New item earned: ${item.name}`, { description: "Equip it from your Locker." });
        }
      }
    },
  });

  const recordMastery = useMutation({
    mutationFn: (theme: string) => masteryFn({ data: { theme } }),
    onSuccess: (res) => {
      if (res.newItems.length > 0) {
        qc.invalidateQueries({ queryKey: avatarQueryKey });
        toast.success(`Mastery set unlocked! +${res.newItems.length} items`, {
          description: "Find them in your Locker.",
        });
      }
    },
  });

  return {
    state: q.data ?? DEFAULT_AVATAR_STATE,
    isLoading: q.isLoading,
    updateParts: updateParts.mutate,
    equip: equip.mutate,
    recordOnTime: recordOnTime.mutate,
    recordMastery: recordMastery.mutate,
  };
}
