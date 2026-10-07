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

/** Accepts a string, null, or a missing key. Legacy seedbot2000 rows omit columns entirely. */
export function isOptionalString(
  value: unknown,
): value is string | null | undefined {
  return value == null || isString(value);
}
