import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, timestamp, unique, index, jsonb } from "drizzle-orm/pg-core";
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
  firstName: varchar("firstName"),
  lastName: varchar("lastName"),
  profileImageUrl: varchar("profileImageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Pairs table - represents buddy relationships with shared honey pots
export const pairs = pgTable("pairs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userAId: varchar("userAId", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  userBId: varchar("userBId", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  potBalance: integer("potBalance").notNull().default(0), // in rupees/coins
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  // Ensure the same two users can't have duplicate pairs (normalized: userA < userB)
  uniquePair: unique().on(table.userAId, table.userBId),
  userAIdx: index("pairs_user_a_idx").on(table.userAId),
  userBIdx: index("pairs_user_b_idx").on(table.userBId),
}));

// Workouts table - stores global daily workout status per user
export const workouts = pgTable("workouts", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userId", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(), // store in UTC
  status: text("status", { enum: ["worked", "missed"] }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  // Ensure one workout status per user per date
  uniqueUserDate: unique().on(table.userId, table.date),
  userDateIdx: index("workouts_user_date_idx").on(table.userId, table.date),
}));

// Settlements table - records pot settlements when one person loses
export const settlements = pgTable("settlements", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  pairId: varchar("pairId", { length: 255 }).notNull().references(() => pairs.id, { onDelete: "cascade" }),
  weekStartDate: date("weekStartDate").notNull(), // Monday of the week
  loserUserId: varchar("loserUserId", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  winnerUserId: varchar("winnerUserId", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // pot amount at time of settlement
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate settlements for the same pair and week
  uniquePairWeek: unique().on(table.pairId, table.weekStartDate),
  pairWeekIdx: index("settlements_pair_week_idx").on(table.pairId, table.weekStartDate),
}));

// Buddy Invitations table - stores pending invitations for users who haven't signed up yet
export const buddyInvitations = pgTable("buddy_invitations", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  inviterUserId: varchar("inviterUserId", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteeEmail: varchar("inviteeEmail").notNull(), // Email of person being invited
  inviteeName: varchar("inviteeName"), // Name provided by inviter
  status: text("status", { enum: ["pending", "accepted", "declined"] }).notNull().default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
}, (table) => ({
  // Prevent duplicate pending invitations for same inviter-email pair
  uniquePendingInvite: unique().on(table.inviterUserId, table.inviteeEmail),
  inviterIdx: index("invitations_inviter_idx").on(table.inviterUserId),
  emailIdx: index("invitations_email_idx").on(table.inviteeEmail),
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
