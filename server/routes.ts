import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { 
  getSessionConfig,
  type AuthenticatedRequest 
} from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session is already configured in index.ts

  // Auth Routes - Simple working authentication
  app.post("/api/auth/login", (req: Request, res: Response) => {
    console.log("Login request received:", req.body);
    const { username, password } = req.body;
    console.log("Username:", username, "Password:", password);
    
    // Demo users
    if ((username === "admin" && password === "admin123") ||
        (username === "agent" && password === "agent123") ||
        (username === "customer" && password === "customer123")) {
      
      const userMap = {
        admin: { id: 1, username: "admin", email: "admin@mcredit.com", fullName: "System Administrator", role: "admin" },
        agent: { id: 2, username: "agent", email: "agent@mcredit.com", fullName: "Loan Agent", role: "agent" },
        customer: { id: 3, username: "customer", email: "customer@example.com", fullName: "Demo Customer", role: "customer" }
      };
      
      const user = userMap[username as keyof typeof userMap];
      
      // Create session
      (req.session as any).user = user;
      
      return res.json({ 
        message: "Login successful", 
        user 
      });
    }
    
    res.status(401).json({ error: "Invalid credentials" });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if ((req.session as any)?.user) {
      res.json({ user: (req.session as any).user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.json({ message: "Logout successful" });
    });
  });

  // Loan application routes
  app.post("/api/loan-applications", (req: Request, res: Response) => {
    if (!(req.session as any)?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const application = {
      id: Date.now(),
      applicationId: `LA${Date.now()}`,
      ...req.body,
      userId: (req.session as any).user.id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.json(application);
  });

  app.get("/api/loan-applications", (req: Request, res: Response) => {
    if (!(req.session as any)?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    res.json([]);
  });

  // Statistics for admin/agent
  app.get("/api/stats", (req: Request, res: Response) => {
    if (!(req.session as any)?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    res.json({
      totalApplications: 0,
      approvedLoans: 0,
      disbursedAmount: 0,
      pendingReview: 0
    });
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}