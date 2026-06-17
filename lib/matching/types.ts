import type { QuizResponses } from '@/lib/types';

export type Tier = 'title' | 'category';

/** A single normalized interest signal. */
export interface TasteTag {
  /** Match key — same interest produces the same key across users. */
  key: string;
  /** Human label, e.g. "Anime · One Piece". */
  display: string;
  tier: Tier;
}

/** A user enriched with their taste tags, ready for clustering. */
export interface PoolUser {
  slug: string;
  name: string;
  referredBy?: string;
  tags: Map<string, TasteTag>;
}

/** One row of the `responses` sheet, with the original quiz JSON. */
export interface ExportRow {
  slug: string;
  firstName: string;
  lastName: string;
  referredBy?: string;
  payload: QuizResponses;
}

export interface ExportFriendship {
  fromSlug: string;
  toSlug: string;
}

/** Everything the engine needs, as returned by the Apps Script export. */
export interface ExportData {
  responses: ExportRow[];
  friendships: ExportFriendship[];
}

/** A candidate plan: a group unified by shared taste. */
export interface PlanCluster {
  members: { slug: string; name: string }[];
  size: number;
  /** Title-level interests shared by the WHOLE group (display labels). */
  titleTags: string[];
  /** Category-level interests shared by the whole group (display labels). */
  categoryTags: string[];
  score: number;
  /** Which ego pool(s) this cluster surfaced in (network mode). */
  egos: string[];
}

export type EdgeMode = 'confirmed' | 'referral' | 'both';

export interface FindPlansOptions {
  /** Smallest group that counts as a plan. Default 4. */
  minSize?: number;
  /** Largest group to emit as a single plan. Default 9. */
  maxSize?: number;
  /** Which relationships define the social graph. Default 'both'. */
  edgeMode?: EdgeMode;
  /** Require the ego to be a member of every cluster. Default true. */
  requireEgo?: boolean;
  /** Cap on returned clusters (best-scored first). Default 60. */
  maxResults?: number;
}
