import Mustache from "mustache";
import React from "react";
import { FlagValue } from "~/state/schemaSlice";

export const renderDescription = (
  template: React.ReactNode | ((value: any) => React.ReactNode),
  value: FlagValue,
) => {
  if (typeof template === "function") {
    return template(value);
  }
  if (typeof template !== "string") {
    return template;
  }
  if (Array.isArray(value)) {
    const arr = value as any[];
    const isIdenticalRange = arr.length > 0 && arr.every((v) => v === arr[0]);
    const displayValue = isIdenticalRange ? arr[0] : arr.join("-");
    return Mustache.render(template, displayValue);
  }
  return Mustache.render(template, value);
};
