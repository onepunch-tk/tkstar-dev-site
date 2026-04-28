import { z } from "zod";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;

export const zNonEmptyString = () => z.string().min(1);

export const zIso8601Date = () => z.string().regex(ISO_DATE_RE, "must be ISO 8601 (YYYY-MM-DD)");

export const zRfc5322Email = () => z.email();
