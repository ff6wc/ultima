import isNumber from "lodash/isNumber";
import isString from "lodash/isString";

/** Makes all properties on object nullable
 * @example
 * // The following presents no error
 * type Foo = { foo: string };
 * const nullable: NullableProperties<Foo> = {
 *   foo: null;
 * }
 */
export type NullableProperties<T> = { [K in keyof T]: T[K] | null };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isOptionalString(value: unknown): value is string | null {
  return value === null || isString(value);
}

export function isNullableNumber(value: unknown): value is number | null {
  return value === null || isNumber(value);
}
