import isBoolean from "lodash/isBoolean";
import isNumber from "lodash/isNumber";
import isString from "lodash/isString";
import { isRecord, isOptionalString } from "~/types/utils";

/** Firestore holds ids as strings now, but rows migrated from seedbot2000 hold numbers. */
export type SeedId = number | string | null;

type ArgsList = string | string[] | null;

export type UserSeed = {
  args_list: ArgsList;
  channel_id: SeedId;
  channel_name: string | null;
  creator_id: SeedId;
  creator_name: string | null;
  flagstring: string | null;
  hash: string | null;
  id: number | string;
  random_sprites: boolean | null;
  seed: string | null;
  seed_type: string;
  server_id: SeedId;
  server_name: string | null;
  share_url: string | null;
  timestamp: string;
};

export type SeedListResponse = UserSeed[];

const isArgsList = (value: unknown): value is ArgsList => {
  return (
    isOptionalString(value) || (Array.isArray(value) && value.every(isString))
  );
};

const isSeedId = (value: unknown): value is SeedId =>
  isOptionalString(value) || isNumber(value);

/**
 * Only id, seed_type and timestamp are needed to render a row, so those are the
 * only hard requirements. Everything else is rendered behind a truthiness check.
 */
export function isUserSeed(value: unknown): value is UserSeed {
  return (
    isRecord(value) &&
    isArgsList(value.args_list) &&
    (isString(value.id) || isNumber(value.id)) &&
    isString(value.seed_type) &&
    isString(value.timestamp) &&
    isSeedId(value.creator_id) &&
    isSeedId(value.server_id) &&
    isSeedId(value.channel_id) &&
    isOptionalString(value.channel_name) &&
    isOptionalString(value.creator_name) &&
    isOptionalString(value.flagstring) &&
    isOptionalString(value.hash) &&
    isOptionalString(value.seed) &&
    isOptionalString(value.server_name) &&
    isOptionalString(value.share_url) &&
    (value.random_sprites == null || isBoolean(value.random_sprites))
  );
}

/** Returns null only when the response is not an array. Bad records are dropped individually. */
export function parseSeedListResponse(value: unknown): SeedListResponse | null {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.filter(isUserSeed);
}
