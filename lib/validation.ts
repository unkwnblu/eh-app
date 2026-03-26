import { z } from "zod";

// ─── Blocked email domains (personal / free providers) ─────────────────────────
const BLOCKED_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "live.co.uk",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "gmx.co.uk",
  "fastmail.com",
  "tutanota.com",
  "tuta.io",
];

function isWorkEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  return !BLOCKED_EMAIL_DOMAINS.includes(domain);
}

// ─── Shared primitives ─────────────────────────────────────────────────────────

const emailField = z.string().min(1, "Email is required").email("Enter a valid email address");

const workEmailField = emailField.refine(isWorkEmail, {
  message: "Please use a work email address (personal emails like Gmail or Outlook are not accepted)",
});

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number");

const nameField = (label: string) =>
  z.string().min(1, `${label} is required`).max(100, `${label} is too long`);

const phoneField = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^[\d\s+()-]{7,20}$/, "Enter a valid phone number");

// ─── Employer registration — per-step schemas ──────────────────────────────────

export const employerStep1Schema = z
  .object({
    email: workEmailField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const employerStep2Schema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  crn: z
    .string()
    .min(1, "Company Registration Number is required")
    .regex(/^\d{7,8}$/, "CRN must be 7 or 8 digits"),
  registeredAddress: z.string().min(1, "Registered address is required"),
  incorporationDate: z.string().min(1, "Incorporation date is required"),
  companyStatus: z.string().min(1, "Select a company status"),
});

export const employerStep3Schema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  jobTitle: z.string().min(1, "Job title is required"),
  vatNumber: z.string().optional(),
});

export const employerStep4Schema = z.object({
  industries: z.array(z.string()).min(1, "Select at least one industry"),
});

export const employerStep5Schema = z.object({
  billingName: z.string().min(1, "Billing name is required"),
  billingEmail: workEmailField,
  billingAddress: z.string().min(1, "Billing address is required"),
  checkTerms: z.literal(true, { message: "You must accept the Terms & Privacy Policy" }),
});

export const employerStepSchemas = [
  employerStep1Schema,
  employerStep2Schema,
  employerStep3Schema,
  employerStep4Schema,
  employerStep5Schema,
] as const;

// ─── Candidate registration — per-step schemas ────────────────────────────────

export const candidateStep1Schema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const candidateStep2Schema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  phone: phoneField,
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
});

export const candidateStep3Schema = z.object({
  documentType: z.string().min(1, "Select a document type"),
  documentNumber: z.string().min(1, "Document number is required"),
  documentExpiry: z.string().min(1, "Document expiry date is required"),
});

export const candidateStep4Schema = z.object({
  sector: z.string().min(1, "Select a sector"),
  jobTypes: z.array(z.string()).min(1, "Select at least one job type"),
  locations: z.array(z.string()).min(1, "Select at least one location"),
});

export const candidateStep5Schema = z.object({
  cvFileName: z.string().min(1, "Please upload your CV"),
  checkPrivacy: z.literal(true, { message: "You must consent to data processing" }),
  checkTerms: z.literal(true, { message: "You must accept the Terms of Service" }),
});

export const candidateStepSchemas = [
  candidateStep1Schema,
  candidateStep2Schema,
  candidateStep3Schema,
  candidateStep4Schema,
  candidateStep5Schema,
] as const;

// ─── Login schemas ─────────────────────────────────────────────────────────────

export const employerLoginSchema = z.object({
  email: workEmailField,
  password: z.string().min(1, "Password is required"),
});

export const candidateLoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

// ─── Utility: validate and return field errors ─────────────────────────────────

export type FieldErrors = Record<string, string>;

export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: FieldErrors } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
