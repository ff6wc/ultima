import isNumber from "lodash/isNumber";
import isString from "lodash/isString";
import isBoolean from "lodash/isBoolean";
import { isRecord, isNullableNumber, isNullableString } from "~/types/utils";

export type UserSeed = {
  args_list: string[] | null;
  channel_id: number | null;
  channel_name: string | null;
  creator_id: number | string;
  creator_name: string;
  flagstring: string | null;
  hash: string | null;
  id: string | number;
  random_sprites: boolean;
  seed: string | null;
  seed_type: string;
  server_id: number | null;
  server_name: string;
  share_url: string | null;
  timestamp: string;
};

export type SeedListResponse = UserSeed[];

export function isSeedListResponse(value: unknown): value is SeedListResponse {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        isNullableNumber(item.channel_id) &&
        isNullableString(item.channel_name) &&
        isNullableNumber(item.creator_id) &&
        isNullableString(item.creator_name) &&
        isNullableString(item.flagstring) &&
        isNullableString(item.hash) &&
        (isNumber(item.id) || isString(item.id)) &&
        isBoolean(item.random_sprites) &&
        isNullableString(item.seed) &&
        isString(item.seed_type) &&
        isNullableNumber(item.server_id) &&
        isString(item.server_name) &&
        isNullableString(item.share_url) &&
        isString(item.timestamp),
    )
  );
}
