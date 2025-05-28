import {
  type User,
  type InsertUser,
  type LoanApplication,
  type InsertLoanApplication,
  type Document,
  type InsertDocument
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Loan application methods
  createLoanApplication(application: InsertLoanApplication, userId: number): Promise<LoanApplication>;
  getLoanApplication(id: number): Promise<LoanApplication | undefined>;
  getLoanApplicationByApplicationId(applicationId: string): Promise<LoanApplication | undefined>;
  getAllLoanApplications(): Promise<LoanApplication[]>;
  getUserLoanApplications(userId: number): Promise<LoanApplication[]>;
  updateLoanApplicationStatus(id: number, status: string): Promise<LoanApplication | undefined>;
  updateDocumentsUploaded(id: number, uploaded: boolean): Promise<LoanApplication | undefined>;
  assignAgentToApplication(applicationId: number, agentId: number): Promise<LoanApplication | undefined>;

  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByApplicationId(applicationId: number): Promise<Document[]>;
  updateDocumentVerification(documentId: number, status: string, verifiedBy: number, rejectionReason?: string): Promise<Document | undefined>;

  // Statistics
  getApplicationStats(): Promise<{
    totalApplications: number;
    approvedLoans: number;
    disbursedAmount: number;
    pendingReview: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private loanApplications: Map<number, LoanApplication>;
  private documents: Map<number, Document>;
  private currentUserId: number;
  private currentApplicationId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.loanApplications = new Map();
    this.documents = new Map();
    this.currentUserId = 1;
    this.currentApplicationId = 1;
    this.currentDocumentId = 1;

    // Create default users for demo with pre-hashed passwords
    this.initializeDemoUsers();
    console.log("Demo users initialized. Total users:", this.users.size);
  }

  private initializeDemoUsers() {
    // Create demo users with properly hashed passwords
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      email: "admin@mcredit.com",
      password: "$2b$12$2oNjXGEpyUSPZ1BLEcDB4eYicT56MgXCqCacHOPannk5Oy3jfF7tK", // admin123
      fullName: "System Administrator",
      role: "admin",
      mobile: "9876543210",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    const agentUser: User = {
      id: this.currentUserId++,
      username: "agent",
      email: "agent@mcredit.com",
      password: "$2b$12$W88sxESpw7cLkiWzTSBj8O2NKXXLnoAyVsu9aRklN0wgpJSjBA3zy", // agent123
      fullName: "Loan Agent",
      role: "agent",
      mobile: "9876543211",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(agentUser.id, agentUser);

    const customerUser: User = {
      id: this.currentUserId++,
      username: "customer",
      email: "customer@example.com",
      password: "$2b$12$Zz2YfEPFhTQY9UGaIQQNbecaotL3A8iODM8TCgxBcS7QU3LEuv9L2", // customer123
      fullName: "Demo Customer",
      role: "customer",
      mobile: "9876543212",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(customerUser.id, customerUser);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log("Looking for user:", username);
    console.log("Available users:", Array.from(this.users.values()).map(u => u.username));
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      mobile: insertUser.mobile || null,
      isActive: insertUser.isActive || true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async createLoanApplication(application: InsertLoanApplication, userId: number): Promise<LoanApplication> {
    const id = this.currentApplicationId++;
    const applicationId = `LA${Date.now()}${id}`;
    
    const loanApplication: LoanApplication = {
      ...application,
      id,
      userId,
      applicationId,
      status: "pending",
      assignedAgent: null,
      kycStatus: "pending",
      kycScheduledAt: null,
      kycCompletedAt: null,
      documentsUploaded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.loanApplications.set(id, loanApplication);
    return loanApplication;
  }

  async getLoanApplication(id: number): Promise<LoanApplication | undefined> {
    return this.loanApplications.get(id);
  }

  async getLoanApplicationByApplicationId(applicationId: string): Promise<LoanApplication | undefined> {
    for (const application of this.loanApplications.values()) {
      if (application.applicationId === applicationId) {
        return application;
      }
    }
    return undefined;
  }

  async getAllLoanApplications(): Promise<LoanApplication[]> {
    return Array.from(this.loanApplications.values());
  }

  async getUserLoanApplications(userId: number): Promise<LoanApplication[]> {
    return Array.from(this.loanApplications.values()).filter(
      app => app.userId === userId
    );
  }

  async updateLoanApplicationStatus(id: number, status: string): Promise<LoanApplication | undefined> {
    const application = this.loanApplications.get(id);
    if (application) {
      application.status = status;
      application.updatedAt = new Date();
      this.loanApplications.set(id, application);
    }
    return application;
  }

  async updateDocumentsUploaded(id: number, uploaded: boolean): Promise<LoanApplication | undefined> {
    const application = this.loanApplications.get(id);
    if (application) {
      application.documentsUploaded = uploaded;
      application.updatedAt = new Date();
      this.loanApplications.set(id, application);
    }
    return application;
  }

  async assignAgentToApplication(applicationId: number, agentId: number): Promise<LoanApplication | undefined> {
    const application = this.loanApplications.get(applicationId);
    if (application) {
      application.assignedAgent = agentId;
      application.updatedAt = new Date();
      this.loanApplications.set(applicationId, application);
    }
    return application;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const doc: Document = { 
      ...document, 
      id,
      verificationStatus: "pending",
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: null,
      uploadedAt: new Date() 
    };
    this.documents.set(id, doc);
    return doc;
  }

  async getDocumentsByApplicationId(applicationId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.applicationId === applicationId
    );
  }

  async updateDocumentVerification(documentId: number, status: string, verifiedBy: number, rejectionReason?: string): Promise<Document | undefined> {
    const document = this.documents.get(documentId);
    if (document) {
      document.verificationStatus = status;
      document.verifiedBy = verifiedBy;
      document.verifiedAt = new Date();
      document.rejectionReason = rejectionReason || null;
      this.documents.set(documentId, document);
    }
    return document;
  }

  async getApplicationStats(): Promise<{
    totalApplications: number;
    approvedLoans: number;
    disbursedAmount: number;
    pendingReview: number;
  }> {
    const applications = Array.from(this.loanApplications.values());
    
    return {
      totalApplications: applications.length,
      approvedLoans: applications.filter(app => app.status === "approved").length,
      disbursedAmount: applications
        .filter(app => app.status === "disbursed")
        .reduce((sum, app) => sum + app.loanAmount, 0),
      pendingReview: applications.filter(app => app.status === "pending").length,
    };
  }
}

export const storage = new MemStorage();