import {
  users,
  pairs,
  workouts,
  settlements,
  buddyInvitations,
  type User,
  type UpsertUser,
  type Pair,
  type InsertPair,
  type Workout,
  type InsertWorkout,
  type Settlement,
  type InsertSettlement,
  type BuddyInvitation,
  type InsertBuddyInvitation,
  type PairWithUsers,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, gte, lte, desc, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;

  // Pair operations
  createPair(userAId: string, userBId: string): Promise<Pair>;
  getUserPairs(userId: string): Promise<Array<Pair & { buddyId: string; buddyUser: User }>>;
  getPair(pairId: string): Promise<Pair | undefined>;
  updatePotBalance(pairId: string, amount: number): Promise<Pair>;
  resetPotBalance(pairId: string): Promise<{ oldBalance: number; pair: Pair }>;
  
  // Workout operations
  getWorkout(userId: string, date: string): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getUserWorkouts(userId: string, startDate: string, endDate: string): Promise<Workout[]>;
  getWeekWorkoutCount(userId: string, weekStartDate: string): Promise<number>;
  
  // Settlement operations
  createSettlement(settlement: InsertSettlement): Promise<Settlement>;
  getPairSettlements(pairId: string): Promise<Settlement[]>;
  getSettlementForWeek(pairId: string, weekStartDate: string): Promise<Settlement | undefined>;
  
  // Buddy invitation operations
  createInvitation(invitation: InsertBuddyInvitation): Promise<BuddyInvitation>;
  getInvitationsForEmail(email: string): Promise<Array<BuddyInvitation & { inviter: User }>>;
  acceptInvitation(invitationId: string, acceptingUserId: string): Promise<{ invitation: BuddyInvitation; pair: Pair }>;
  getPendingInvitations(userId: string): Promise<Array<BuddyInvitation & { invitee: Partial<User> | null }>>;
  deleteInvitation(invitationId: string): Promise<void>;
  
  // Delete pair operations
  deletePair(pairId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // Pair operations
  async createPair(userAId: string, userBId: string): Promise<Pair> {
    // Normalize pair so userA < userB to prevent duplicates
    const [smallerId, largerId] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];
    
    const [pair] = await db
      .insert(pairs)
      .values({
        userAId: smallerId,
        userBId: largerId,
      })
      .returning();
    return pair;
  }

  async getUserPairs(userId: string): Promise<Array<Pair & { buddyId: string; buddyUser: User }>> {
    // Get all pairs where user is either userA or userB
    const userPairs = await db
      .select()
      .from(pairs)
      .where(or(eq(pairs.userAId, userId), eq(pairs.userBId, userId)));

    // For each pair, determine the buddy and fetch their info
    const result = await Promise.all(
      userPairs.map(async (pair) => {
        // Determine which user is the buddy (the one that's not the current user)
        const buddyId = pair.userAId === userId ? pair.userBId : pair.userAId;
        const [buddyUser] = await db.select().from(users).where(eq(users.id, buddyId));
        
        return {
          ...pair,
          buddyId,
          buddyUser: buddyUser!,
        };
      })
    );

    return result;
  }

  async getPair(pairId: string): Promise<Pair | undefined> {
    const [pair] = await db.select().from(pairs).where(eq(pairs.id, pairId));
    return pair;
  }

  async updatePotBalance(pairId: string, amount: number): Promise<Pair> {
    const [pair] = await db
      .update(pairs)
      .set({
        potBalance: sql`${pairs.potBalance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(pairs.id, pairId))
      .returning();
    return pair;
  }

  async resetPotBalance(pairId: string): Promise<{ oldBalance: number; pair: Pair }> {
    // Atomic operation using CTE to capture old balance before resetting
    // This prevents concurrent deposits from being lost during settlement
    const result: any = await db.execute(sql`
      WITH old_balance AS (
        SELECT pot_balance FROM ${pairs} WHERE id = ${pairId}
      )
      UPDATE ${pairs}
      SET pot_balance = 0, updated_at = NOW()
      WHERE id = ${pairId}
      RETURNING *, (SELECT pot_balance FROM old_balance) as old_pot_balance
    `);
    
    if (!result.rows || result.rows.length === 0) {
      throw new Error("Pair not found");
    }
    
    const row = result.rows[0];
    const oldBalance = row.old_pot_balance;
    
    // Construct the updated pair object
    const pair: Pair = {
      id: row.id,
      userAId: row.user_a_id,
      userBId: row.user_b_id,
      potBalance: row.pot_balance,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    
    return { oldBalance, pair };
  }

  // Workout operations
  async getWorkout(userId: string, date: string): Promise<Workout | undefined> {
    const [workout] = await db
      .select()
      .from(workouts)
      .where(and(eq(workouts.userId, userId), eq(workouts.date, date)));
    return workout;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [result] = await db
      .insert(workouts)
      .values(workout)
      .onConflictDoUpdate({
        target: [workouts.userId, workouts.date],
        set: {
          status: workout.status,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getUserWorkouts(userId: string, startDate: string, endDate: string): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          gte(workouts.date, startDate),
          lte(workouts.date, endDate)
        )
      )
      .orderBy(workouts.date);
  }

  async getWeekWorkoutCount(userId: string, weekStartDate: string): Promise<number> {
    // Week is Monday to Sunday (7 days)
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    
    const result = await db
      .select({ count: count() })
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          eq(workouts.status, "worked"),
          gte(workouts.date, weekStartDate),
          lte(workouts.date, weekEndDate.toISOString().split('T')[0])
        )
      );
    
    return result[0]?.count || 0;
  }

  // Settlement operations
  async createSettlement(settlement: InsertSettlement): Promise<Settlement> {
    const [result] = await db
      .insert(settlements)
      .values(settlement)
      .returning();
    return result;
  }

  async getPairSettlements(pairId: string): Promise<Settlement[]> {
    return await db
      .select()
      .from(settlements)
      .where(eq(settlements.pairId, pairId))
      .orderBy(desc(settlements.weekStartDate));
  }

  async getSettlementForWeek(pairId: string, weekStartDate: string): Promise<Settlement | undefined> {
    const [settlement] = await db
      .select()
      .from(settlements)
      .where(
        and(
          eq(settlements.pairId, pairId),
          eq(settlements.weekStartDate, weekStartDate)
        )
      );
    return settlement;
  }

  // Buddy invitation operations
  async createInvitation(invitation: InsertBuddyInvitation): Promise<BuddyInvitation> {
    const [result] = await db
      .insert(buddyInvitations)
      .values(invitation)
      .onConflictDoNothing()
      .returning();
    return result;
  }

  async getInvitationsForEmail(email: string): Promise<Array<BuddyInvitation & { inviter: User }>> {
    const invitations = await db
      .select()
      .from(buddyInvitations)
      .where(and(
        eq(buddyInvitations.inviteeEmail, email),
        eq(buddyInvitations.status, "pending")
      ));

    return Promise.all(
      invitations.map(async (inv) => {
        const [inviter] = await db.select().from(users).where(eq(users.id, inv.inviterUserId));
        return {
          ...inv,
          inviter: inviter!,
        };
      })
    );
  }

  async acceptInvitation(invitationId: string, acceptingUserId: string): Promise<{ invitation: BuddyInvitation; pair: Pair }> {
    // Get the invitation
    const [invitation] = await db
      .select()
      .from(buddyInvitations)
      .where(eq(buddyInvitations.id, invitationId));

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Mark invitation as accepted
    const [updatedInvitation] = await db
      .update(buddyInvitations)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
      })
      .where(eq(buddyInvitations.id, invitationId))
      .returning();

    // Create pair between inviter and acceptor
    const pair = await this.createPair(invitation.inviterUserId, acceptingUserId);

    return { invitation: updatedInvitation, pair };
  }

  async getPendingInvitations(userId: string): Promise<Array<BuddyInvitation & { invitee: Partial<User> | null }>> {
    const invitations = await db
      .select()
      .from(buddyInvitations)
      .where(and(
        eq(buddyInvitations.inviterUserId, userId),
        eq(buddyInvitations.status, "pending")
      ));

    return Promise.all(
      invitations.map(async (inv) => {
        // Try to find user with this email
        const [invitee] = await db
          .select()
          .from(users)
          .where(eq(users.email, inv.inviteeEmail));

        return {
          ...inv,
          invitee: invitee || null,
        };
      })
    );
  }

  async deleteInvitation(invitationId: string): Promise<void> {
    await db
      .delete(buddyInvitations)
      .where(eq(buddyInvitations.id, invitationId));
  }

  async deletePair(pairId: string): Promise<void> {
    await db
      .delete(pairs)
      .where(eq(pairs.id, pairId));
  }

  async recalculatePotBalance(pairId: string, userId: string): Promise<number> {
    // Get the pair
    const pair = await this.getPair(pairId);
    if (!pair) {
      throw new Error("Pair not found");
    }

    // Get the last settlement for this pair to use as reference
    const lastSettlements = await db
      .select()
      .from(settlements)
      .where(eq(settlements.pairId, pairId))
      .orderBy(desc(settlements.weekStartDate))
      .limit(1);

    // Get pair creation date
    const pairCreatedDate = pair.createdAt instanceof Date 
      ? pair.createdAt 
      : new Date(pair.createdAt);

    // Use the LATER of: last settlement date OR pair creation date
    // This ensures we never count missed workouts from before the pair was created
    let startDate: Date;
    if (lastSettlements.length > 0) {
      const settlementDate = new Date(lastSettlements[0].weekStartDate);
      // Use whichever is later
      startDate = settlementDate > pairCreatedDate ? settlementDate : pairCreatedDate;
    } else {
      startDate = pairCreatedDate;
    }

    // Format date as YYYY-MM-DD using local timezone to match how workout dates are stored
    const formatDateLocal = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const startDateStr = formatDateLocal(startDate);
    console.log(`[Recalculate] Pair ${pairId}: startDate=${startDateStr}, createdAt=${pair.createdAt}`);

    // Count BOTH users' missed workouts since reference date
    const missedWorkouts = await db
      .select({ count: count() })
      .from(workouts)
      .where(
        and(
          or(
            eq(workouts.userId, pair.userAId),
            eq(workouts.userId, pair.userBId)
          ),
          eq(workouts.status, "missed"),
          gte(workouts.date, startDateStr)
        )
      );

    const missCount = missedWorkouts[0]?.count || 0;
    const correctBalance = missCount * 20;
    console.log(`[Recalculate] Pair ${pairId}: missCount=${missCount}, correctBalance=${correctBalance}`);

    // Update pot to correct balance
    const [updatedPair] = await db
      .update(pairs)
      .set({
        potBalance: correctBalance,
        updatedAt: new Date(),
      })
      .where(eq(pairs.id, pairId))
      .returning();

    return correctBalance;
  }

  async recalculateAllUserPots(userId: string): Promise<Array<{ pairId: string; correctBalance: number }>> {
    const userPairs = await this.getUserPairs(userId);
    const results = [];

    for (const pair of userPairs) {
      const correctBalance = await this.recalculatePotBalance(pair.id, userId);
      results.push({ pairId: pair.id, correctBalance });
    }

    return results;
  }
}

export const storage = new DatabaseStorage();
