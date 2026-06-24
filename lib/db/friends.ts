import { createAdminClient } from '@/lib/supabase/admin';

export interface ConfirmFriendInput {
  fromSlug: string;
  toSlug: string;
  toName: string;
  mutualFriend?: string;
  commonCount?: number;
}

/**
 * Record a confirmed connection from the friend-confirmation step. Handle-based
 * to match the existing slug semantics and the matching engine. Idempotent —
 * re-confirming the same pair updates rather than erroring (unique edge).
 */
export async function confirmFriend(input: ConfirmFriendInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('friend_edges').upsert(
    {
      from_handle: input.fromSlug,
      to_handle: input.toSlug,
      mutual_friend: input.mutualFriend || null,
      common_count: input.commonCount ?? 0,
    },
    { onConflict: 'from_handle,to_handle' }
  );
  if (error) throw new Error(`confirmFriend: ${error.message}`);
}
