import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // customer, agent, admin
  fullName: text("full_name").notNull(),
  mobile: text("mobile"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loanApplications = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  applicationId: text("application_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  address: text("address").notNull(),
  monthlyIncome: text("monthly_income").notNull(),
  employmentType: text("employment_type").notNull(),
  loanAmount: integer("loan_amount").notNull(),
  loanTenure: integer("loan_tenure").notNull().default(120), // 120 days
  processingFees: integer("processing_fees").notNull(),
  purpose: text("purpose").notNull(),
  dailyCollection: integer("daily_collection").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, under_review, document_verification, approved, rejected, disbursed
  assignedAgent: integer("assigned_agent").references(() => users.id),
  kycStatus: text("kyc_status").default("pending"), // pending, in_progress, completed, rejected
  kycScheduledAt: timestamp("kyc_scheduled_at"),
  kycCompletedAt: timestamp("kyc_completed_at"),
  documentsUploaded: boolean("documents_uploaded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => loanApplications.id),
  documentType: text("document_type").notNull(), // photo, aadhar_card, pan_card, address_proof, income_proof, bank_statement, signature, other
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  filePath: text("file_path").notNull(),
  verificationStatus: text("verification_status").default("pending"), // pending, verified, rejected
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  mobile: z.string().regex(/^\+?91\s?\d{10}$/, "Please enter a valid mobile number").optional(),
  role: z.enum(["customer", "agent", "admin"]).default("customer"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Loan application schemas
export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({
  id: true,
  userId: true,
  applicationId: true,
  status: true,
  assignedAgent: true,
  kycStatus: true,
  kycScheduledAt: true,
  kycCompletedAt: true,
  documentsUploaded: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  mobile: z.string().regex(/^\+?91\s?\d{10}$/, "Please enter a valid mobile number"),
  email: z.string().email("Please enter a valid email address"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  monthlyIncome: z.string().min(1, "Please select your monthly income"),
  employmentType: z.string().min(1, "Please select your employment type"),
  loanAmount: z.number().min(10000, "Minimum loan amount is ₹10,000").max(500000, "Maximum loan amount is ₹5,00,000"),
  loanTenure: z.number().default(120),
  processingFees: z.number().min(1),
  purpose: z.string().min(1, "Please select loan purpose"),
  dailyCollection: z.number().min(1),
  totalAmount: z.number().min(1),
});

// Document schemas
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  verificationStatus: true,
  verifiedBy: true,
  verifiedAt: true,
  rejectionReason: true,
  uploadedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
