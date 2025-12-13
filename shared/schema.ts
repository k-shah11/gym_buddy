import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, timestamp, unique, index, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// Users table - stores user account information from Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pairs table - represents buddy relationships with shared honey pots
export const pairs = pgTable("pairs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userAId: varchar("user_a_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  userBId: varchar("user_b_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  potBalance: integer("pot_balance").notNull().default(0), // in rupees/coins
  isPaused: boolean("is_paused").notNull().default(false), // whether competition is paused
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Ensure the same two users can't have duplicate pairs (normalized: userA < userB)
  uniquePair: unique().on(table.userAId, table.userBId),
  userAIdx: index("pairs_user_a_idx").on(table.userAId),
  userBIdx: index("pairs_user_b_idx").on(table.userBId),
}));

// Workouts table - stores global daily workout status per user
export const workouts = pgTable("workouts", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(), // store in UTC
  status: text("status", { enum: ["worked", "missed"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Ensure one workout status per user per date
  uniqueUserDate: unique().on(table.userId, table.date),
  userDateIdx: index("workouts_user_date_idx").on(table.userId, table.date),
}));

// Settlements table - records pot settlements when one person loses
export const settlements = pgTable("settlements", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  pairId: varchar("pair_id", { length: 255 }).notNull().references(() => pairs.id, { onDelete: "cascade" }),
  weekStartDate: date("week_start_date").notNull(), // Monday of the week
  loserUserId: varchar("loser_user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  winnerUserId: varchar("winner_user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // pot amount at time of settlement
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate settlements for the same pair and week
  uniquePairWeek: unique().on(table.pairId, table.weekStartDate),
  pairWeekIdx: index("settlements_pair_week_idx").on(table.pairId, table.weekStartDate),
}));

// Buddy Invitations table - stores pending invitations for users who haven't signed up yet
export const buddyInvitations = pgTable("buddy_invitations", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  inviterUserId: varchar("inviter_user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteeEmail: varchar("invitee_email").notNull(), // Email of person being invited
  inviteeName: varchar("invitee_name"), // Name provided by inviter
  status: text("status", { enum: ["pending", "accepted", "declined"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at"),
}, (table) => ({
  // Prevent duplicate pending invitations for same inviter-email pair
  uniquePendingInvite: unique().on(table.inviterUserId, table.inviteeEmail),
  inviterIdx: index("invitations_inviter_idx").on(table.inviterUserId),
  emailIdx: index("invitations_email_idx").on(table.inviteeEmail),
}));

// Pause Requests table - stores pending requests to pause/resume competition
export const pauseRequests = pgTable("pause_requests", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  pairId: varchar("pair_id", { length: 255 }).notNull().references(() => pairs.id, { onDelete: "cascade" }),
  requesterId: varchar("requester_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  requestType: text("request_type", { enum: ["pause", "resume"] }).notNull(),
  status: text("status", { enum: ["pending", "accepted", "denied"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
}, (table) => ({
  // Only one pending request per pair at a time
  pairIdx: index("pause_requests_pair_idx").on(table.pairId),
  requesterIdx: index("pause_requests_requester_idx").on(table.requesterId),
}));

// Reset Pot Requests table - stores pending requests to reset the pot balance
export const resetPotRequests = pgTable("reset_pot_requests", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  pairId: varchar("pair_id", { length: 255 }).notNull().references(() => pairs.id, { onDelete: "cascade" }),
  requesterId: varchar("requester_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "accepted", "denied"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
}, (table) => ({
  pairIdx: index("reset_pot_requests_pair_idx").on(table.pairId),
  requesterIdx: index("reset_pot_requests_requester_idx").on(table.requesterId),
}));

// Zod schemas for validation
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPairSchema = createInsertSchema(pairs).omit({
  id: true,
  potBalance: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSettlementSchema = createInsertSchema(settlements).omit({
  id: true,
  createdAt: true,
});

export const insertBuddyInvitationSchema = createInsertSchema(buddyInvitations).omit({
  id: true,
  status: true,
  createdAt: true,
  acceptedAt: true,
});

export const insertPauseRequestSchema = createInsertSchema(pauseRequests).omit({
  id: true,
  status: true,
  createdAt: true,
  respondedAt: true,
});

export const insertResetPotRequestSchema = createInsertSchema(resetPotRequests).omit({
  id: true,
  status: true,
  createdAt: true,
  respondedAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type Pair = typeof pairs.$inferSelect;
export type InsertPair = z.infer<typeof insertPairSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type Settlement = typeof settlements.$inferSelect;
export type InsertSettlement = z.infer<typeof insertSettlementSchema>;

export type BuddyInvitation = typeof buddyInvitations.$inferSelect;
export type InsertBuddyInvitation = z.infer<typeof insertBuddyInvitationSchema>;

export type PauseRequest = typeof pauseRequests.$inferSelect;
export type InsertPauseRequest = z.infer<typeof insertPauseRequestSchema>;

export type ResetPotRequest = typeof resetPotRequests.$inferSelect;
export type InsertResetPotRequest = z.infer<typeof insertResetPotRequestSchema>;

// Helper type for pair with user details
export type PairWithUsers = Pair & {
  userA: User;
  userB: User;
};

// Helper type for workout summary
export type WeekSummary = {
  weekStartDate: string;
  workoutDays: Array<'worked' | 'missed' | null>;
  workoutCount: number;
};
