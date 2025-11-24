import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, setupFallbackAuthRoutes, isAuthenticated } from "./replitAuth";
import { insertPairSchema, insertWorkoutSchema } from "@shared/schema";

// Helper to get Monday of a given date's week
function getWeekStartDate(date: Date): string {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(date);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

// Helper to get user ID from request
function getUserId(req: Request): string {
  return (req.user as any)?.claims?.sub;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database schema in background AFTER server starts
  // Don't block startup at all
  
  // Auth middleware
  await setupAuth(app);
  
  // Fallback auth routes for non-Replit environments (e.g., Railway)
  setupFallbackAuthRoutes(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Buddy/Pair routes
  app.get('/api/buddies', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const pairs = await storage.getUserPairs(userId);
      
      // Map to buddy format with pot info
      const buddies = pairs.map(pair => ({
        pairId: pair.id,
        buddy: {
          id: pair.buddyUser.id,
          name: `${pair.buddyUser.firstName || ''} ${pair.buddyUser.lastName || ''}`.trim() || pair.buddyUser.email,
          email: pair.buddyUser.email,
          profileImageUrl: pair.buddyUser.profileImageUrl,
        },
        potBalance: pair.potBalance,
      }));
      
      res.json(buddies);
    } catch (error) {
      console.error("Error fetching buddies:", error);
      res.status(500).json({ message: "Failed to fetch buddies" });
    }
  });

  app.post('/api/buddies', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { email, name } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find buddy by email
      const buddy = await storage.getUserByEmail(email);
      
      if (buddy) {
        // User exists - create pair directly
        if (buddy.id === userId) {
          return res.status(400).json({ message: "You cannot add yourself as a buddy" });
        }
        
        // Check if pair already exists
        const existingPairs = await storage.getUserPairs(userId);
        const alreadyPaired = existingPairs.some(p => p.buddyId === buddy.id);
        
        if (alreadyPaired) {
          return res.status(400).json({ message: "You are already buddies with this user" });
        }
        
        // Create pair
        const pair = await storage.createPair(userId, buddy.id);
        
        res.json({
          pairId: pair.id,
          buddy: {
            id: buddy.id,
            name: `${buddy.firstName || ''} ${buddy.lastName || ''}`.trim() || buddy.email,
            email: buddy.email,
            profileImageUrl: buddy.profileImageUrl,
          },
          potBalance: pair.potBalance,
        });
      } else {
        // User hasn't signed up yet - create invitation
        const invitation = await storage.createInvitation({
          inviterUserId: userId,
          inviteeEmail: email,
          inviteeName: name || email,
        });
        
        res.json({
          type: "invitation",
          message: `Invitation sent to ${email}! They can sign up and accept to become your buddy.`,
          invitation,
        });
      }
    } catch (error) {
      console.error("Error adding buddy:", error);
      res.status(500).json({ message: "Failed to add buddy" });
    }
  });

  // Get pending invitations sent by user
  app.get('/api/invitations/pending', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const invitations = await storage.getPendingInvitations(userId);
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  // Get invitations received by user (at signup)
  app.get('/api/invitations/received', isAuthenticated, async (req, res) => {
    try {
      const user = (req.user as any)?.claims;
      const userEmail = user?.email;
      
      if (!userEmail) {
        return res.status(400).json({ message: "User email not found" });
      }
      
      const invitations = await storage.getInvitationsForEmail(userEmail);
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching received invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  // Accept an invitation
  app.post('/api/invitations/:invitationId/accept', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { invitationId } = req.params;
      
      const { invitation, pair } = await storage.acceptInvitation(invitationId, userId);
      
      // Invalidate cache on client
      res.json({
        message: "Invitation accepted!",
        invitation,
        pair,
      });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });

  // Delete an invitation
  app.delete('/api/invitations/:invitationId', isAuthenticated, async (req, res) => {
    try {
      const { invitationId } = req.params;
      
      await storage.deleteInvitation(invitationId);
      
      res.json({
        message: "Invitation deleted",
      });
    } catch (error) {
      console.error("Error deleting invitation:", error);
      res.status(500).json({ message: "Failed to delete invitation" });
    }
  });

  // Workout routes
  app.get('/api/workouts/today', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const today = new Date().toISOString().split('T')[0];
      const workout = await storage.getWorkout(userId, today);
      res.json(workout || null);
    } catch (error) {
      console.error("Error fetching today's workout:", error);
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.post('/api/workouts', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const date = req.body.date || new Date().toISOString().split('T')[0];
      const { status } = insertWorkoutSchema.parse({
        userId,
        date,
        status: req.body.status,
      });
      
      // Get previous workout status (if exists)
      const previousWorkout = await storage.getWorkout(userId, date);
      const previousStatus = previousWorkout?.status;
      
      // Create or update workout
      const workout = await storage.createWorkout({ userId, date, status });
      
      // Only update pot balance if status actually changed
      const pairs = await storage.getUserPairs(userId);
      
      if (previousStatus !== status) {
        // Status changed - determine pot adjustment
        let potAdjustment = 0;
        
        if (previousStatus === "worked" && status === "missed") {
          // Changed from worked out to missed - ADD ₹20
          potAdjustment = 20;
        } else if (previousStatus === "missed" && status === "worked") {
          // Changed from missed to worked out - REMOVE ₹20
          potAdjustment = -20;
        } else if (!previousStatus && status === "missed") {
          // First entry and it's a miss - ADD ₹20 (catches both null and undefined)
          potAdjustment = 20;
        }
        
        // Update all pair pots
        if (potAdjustment !== 0) {
          await Promise.all(
            pairs.map(pair => storage.updatePotBalance(pair.id, potAdjustment))
          );
        }
      }
      
      res.json(workout);
    } catch (error) {
      console.error("Error logging workout:", error);
      res.status(500).json({ message: "Failed to log workout" });
    }
  });

  app.get('/api/workouts/history', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const weeks = parseInt(req.query.weeks as string) || 4;
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeks * 7));
      
      const workouts = await storage.getUserWorkouts(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      // Group by week
      const weekMap = new Map<string, any>();
      
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(endDate);
        weekStart.setDate(weekStart.getDate() - ((i + 1) * 7));
        const weekStartStr = getWeekStartDate(weekStart);
        
        weekMap.set(weekStartStr, {
          weekStartDate: weekStartStr,
          workouts: [],
          workoutCount: 0,
        });
      }
      
      // Fill in workouts
      workouts.forEach(workout => {
        const weekStart = getWeekStartDate(new Date(workout.date));
        const week = weekMap.get(weekStart);
        if (week) {
          week.workouts.push(workout);
          if (workout.status === "worked") {
            week.workoutCount++;
          }
        }
      });
      
      const weeksArray = Array.from(weekMap.values()).reverse();
      res.json(weeksArray);
    } catch (error) {
      console.error("Error fetching workout history:", error);
      res.status(500).json({ message: "Failed to fetch workout history" });
    }
  });

  // Weekly evaluation - check for completed weeks and settle pots
  app.post('/api/evaluate-weeks', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      // Get all user's pairs
      const pairs = await storage.getUserPairs(userId);
      
      // Check last 4 weeks for settlements
      const settlementsCreated = [];
      
      for (const pair of pairs) {
        const buddyId = pair.buddyId; // This is now correctly calculated by getUserPairs
        
        // Check last 4 weeks
        for (let weeksAgo = 1; weeksAgo <= 4; weeksAgo++) {
          const date = new Date();
          date.setDate(date.getDate() - (weeksAgo * 7));
          const weekStart = getWeekStartDate(date);
          
          // Check if settlement already exists
          const existingSettlement = await storage.getSettlementForWeek(pair.id, weekStart);
          if (existingSettlement) continue;
          
          // Check if week is complete (ended at least 1 day ago)
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          if (weekEnd > new Date()) continue;
          
          // Get workout counts for both users
          const userCount = await storage.getWeekWorkoutCount(userId, weekStart);
          const buddyCount = await storage.getWeekWorkoutCount(buddyId, weekStart);
          
          // Apply settlement rules
          const userMetGoal = userCount >= 4;
          const buddyMetGoal = buddyCount >= 4;
          
          // Exactly one person failed
          if (userMetGoal !== buddyMetGoal) {
            const loserId = userMetGoal ? buddyId : userId;
            const winnerId = userMetGoal ? userId : buddyId;
            
            // Atomically reset pot and get the amount settled
            const { oldBalance } = await storage.resetPotBalance(pair.id);
            
            // Create settlement record
            const settlement = await storage.createSettlement({
              pairId: pair.id,
              weekStartDate: weekStart,
              loserUserId: loserId,
              winnerUserId: winnerId,
              amount: oldBalance,
            });
            
            settlementsCreated.push(settlement);
          }
          // If both met goal or both failed, pot continues accumulating
        }
      }
      
      res.json({
        settlementsCreated: settlementsCreated.length,
        settlements: settlementsCreated,
      });
    } catch (error) {
      console.error("Error evaluating weeks:", error);
      res.status(500).json({ message: "Failed to evaluate weeks" });
    }
  });

  // Get pair details with settlements
  app.get('/api/pairs/:pairId', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { pairId } = req.params;
      
      const pair = await storage.getPair(pairId);
      if (!pair) {
        return res.status(404).json({ message: "Pair not found" });
      }
      
      // Verify user is part of this pair
      if (pair.userAId !== userId && pair.userBId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const settlements = await storage.getPairSettlements(pairId);
      
      res.json({
        pair,
        settlements,
      });
    } catch (error) {
      console.error("Error fetching pair details:", error);
      res.status(500).json({ message: "Failed to fetch pair details" });
    }
  });

  // Stats route
  app.get('/api/stats', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      const pairs = await storage.getUserPairs(userId);
      const totalPots = pairs.reduce((sum, pair) => sum + pair.potBalance, 0);
      
      res.json({
        buddyCount: pairs.length,
        totalPots,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Recalculate all user's pots based on actual workout history
  app.post('/api/pots/recalculate', isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      const results = await storage.recalculateAllUserPots(userId);
      
      res.json({
        message: "Pots recalculated based on actual workout history",
        results,
      });
    } catch (error) {
      console.error("Error recalculating pots:", error);
      res.status(500).json({ message: "Failed to recalculate pots" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
