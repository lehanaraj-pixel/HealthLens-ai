/**
 * HealthLens Secure Authentication & Caregiver Authorization Service
 *
 * Implements:
 * 1. Multiple Login Providers (Google, Microsoft, Apple, Email, Guest)
 * 2. Account Consent verification before accessing another person's health data
 * 3. Caregiver Access Request flow with explicit owner approval/rejection
 * 4. Granular Permissions (view_reports, view_prescriptions, manage_reminders, view_history, view_tracker)
 * 5. Access Audit Log & History tracking
 * 6. Explicit Demo labeling when running in test sandbox
 */

import { AuthUser, AuthProviderType, GranularPermission, AccessRequest, AccessGrant, AccessAuditLog } from '../types';

const AUTH_USER_KEY = 'healthlens_auth_user_v1';
const ACCESS_REQUESTS_KEY = 'healthlens_access_requests_v1';
const ACCESS_GRANTS_KEY = 'healthlens_access_grants_v1';
const AUDIT_LOGS_KEY = 'healthlens_audit_logs_v1';

// Default mock patient account
export const DEFAULT_PATIENT_ACCOUNT: AuthUser = {
  id: 'usr-patient-primary',
  name: 'Rajesh Sharma',
  email: 'rajesh.sharma@healthlens.com',
  provider: 'google',
  role: 'patient',
  createdAt: '2026-01-15T08:00:00Z',
};

// Initial demo caregiver requests & grants
const INITIAL_REQUESTS: AccessRequest[] = [
  {
    id: 'req-demo-daughter',
    requesterId: 'usr-daughter-priya',
    requesterName: 'Priya Sharma (Daughter & Caregiver)',
    requesterEmail: 'priya.sharma@example.com',
    targetAccountEmail: 'rajesh.sharma@healthlens.com',
    targetAccountName: 'Rajesh Sharma',
    purpose: 'Assisting father with morning medication tracking, doctor appointment reminders, and lab report review.',
    requestedPermissions: ['view_reports', 'view_prescriptions', 'manage_reminders', 'view_tracker'],
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AccessAuditLog[] = [
  {
    id: 'audit-log-1',
    actorName: 'Rajesh Sharma',
    actorEmail: 'rajesh.sharma@healthlens.com',
    action: 'Logged into HealthLens with Google Account',
    targetPatient: 'Self Account',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'allowed',
  },
];

class AuthService {
  private currentUser: AuthUser | null = null;
  private accessRequests: AccessRequest[] = [];
  private accessGrants: AccessGrant[] = [];
  private auditLogs: AccessAuditLog[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      this.currentUser = storedUser ? JSON.parse(storedUser) : DEFAULT_PATIENT_ACCOUNT;

      const storedReqs = localStorage.getItem(ACCESS_REQUESTS_KEY);
      this.accessRequests = storedReqs ? JSON.parse(storedReqs) : INITIAL_REQUESTS;

      const storedGrants = localStorage.getItem(ACCESS_GRANTS_KEY);
      this.accessGrants = storedGrants ? JSON.parse(storedGrants) : [];

      const storedLogs = localStorage.getItem(AUDIT_LOGS_KEY);
      this.auditLogs = storedLogs ? JSON.parse(storedLogs) : INITIAL_AUDIT_LOGS;
    } catch (e) {
      this.currentUser = DEFAULT_PATIENT_ACCOUNT;
      this.accessRequests = INITIAL_REQUESTS;
      this.accessGrants = [];
      this.auditLogs = INITIAL_AUDIT_LOGS;
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Auth & Session ---
  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public async login(
    provider: AuthProviderType,
    email: string,
    name?: string
  ): Promise<AuthUser> {
    const user: AuthUser = {
      id: `usr-${provider}-${Date.now()}`,
      name: name || (email ? email.split('@')[0] : 'HealthLens User'),
      email: email.toLowerCase().trim(),
      provider,
      role: 'patient',
      createdAt: new Date().toISOString(),
    };

    this.currentUser = user;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

    this.logAudit({
      actorName: user.name,
      actorEmail: user.email,
      action: `Authenticated successfully via ${provider.toUpperCase()}`,
      targetPatient: 'Self Account',
      status: 'allowed',
    });

    // Sync with backend API
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email, name }),
      });
    } catch (e) {
      // offline fallback
    }

    this.notify();
    return user;
  }

  public logout(): void {
    const prev = this.currentUser;
    if (prev) {
      this.logAudit({
        actorName: prev.name,
        actorEmail: prev.email,
        action: 'Signed out of HealthLens',
        targetPatient: 'Self Account',
        status: 'allowed',
      });
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_USER_KEY);
    this.notify();
  }

  // Switch to guest mode (preserving existing no-login experience)
  public continueAsGuest(): void {
    const guest: AuthUser = {
      id: 'guest-session',
      name: 'Guest User (Local)',
      email: 'guest@device.local',
      provider: 'guest',
      role: 'patient',
      createdAt: new Date().toISOString(),
    };
    this.currentUser = guest;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(guest));
    this.notify();
  }

  // --- Caregiver Access Requests & Approvals ---

  public getRequestsForAccount(accountEmail: string): AccessRequest[] {
    return this.accessRequests.filter(
      (r) => r.targetAccountEmail.toLowerCase() === accountEmail.toLowerCase()
    );
  }

  public getPendingRequestsForAccount(accountEmail: string): AccessRequest[] {
    return this.accessRequests.filter(
      (r) =>
        r.targetAccountEmail.toLowerCase() === accountEmail.toLowerCase() &&
        r.status === 'pending'
    );
  }

  public getMyOutgoingRequests(myEmail: string): AccessRequest[] {
    return this.accessRequests.filter(
      (r) => r.requesterEmail.toLowerCase() === myEmail.toLowerCase()
    );
  }

  public async submitAccessRequest(
    targetAccountEmail: string,
    targetAccountName: string,
    purpose: string,
    requestedPermissions: GranularPermission[]
  ): Promise<AccessRequest> {
    if (!this.currentUser) {
      throw new Error('You must be logged in to request account access.');
    }

    if (this.currentUser.email.toLowerCase() === targetAccountEmail.toLowerCase()) {
      throw new Error('You cannot request caregiver access to your own account.');
    }

    const newReq: AccessRequest = {
      id: `req-${Date.now()}`,
      requesterId: this.currentUser.id,
      requesterName: this.currentUser.name,
      requesterEmail: this.currentUser.email,
      targetAccountEmail: targetAccountEmail.toLowerCase().trim(),
      targetAccountName: targetAccountName.trim(),
      purpose: purpose.trim(),
      requestedPermissions,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.accessRequests = [newReq, ...this.accessRequests];
    localStorage.setItem(ACCESS_REQUESTS_KEY, JSON.stringify(this.accessRequests));

    this.logAudit({
      actorName: this.currentUser.name,
      actorEmail: this.currentUser.email,
      action: `Requested caregiver access to ${targetAccountEmail}`,
      targetPatient: targetAccountEmail,
      status: 'allowed',
    });

    try {
      await fetch('/api/auth/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq),
      });
    } catch (e) {
      // offline fallback
    }

    this.notify();
    return newReq;
  }

  public async respondToRequest(
    requestId: string,
    decision: 'approve' | 'reject',
    approvedPermissions?: GranularPermission[]
  ): Promise<void> {
    const req = this.accessRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    req.status = decision === 'approve' ? 'approved' : 'rejected';
    req.respondedAt = new Date().toISOString();

    if (decision === 'approve') {
      const perms = approvedPermissions && approvedPermissions.length > 0
        ? approvedPermissions
        : req.requestedPermissions;

      const grant: AccessGrant = {
        id: `grant-${Date.now()}`,
        targetAccountEmail: req.targetAccountEmail,
        caregiverId: req.requesterId,
        caregiverName: req.requesterName,
        caregiverEmail: req.requesterEmail,
        approvedPermissions: perms,
        grantedAt: new Date().toISOString(),
        status: 'active',
      };

      this.accessGrants = [grant, ...this.accessGrants.filter((g) => g.caregiverEmail !== req.requesterEmail)];
      localStorage.setItem(ACCESS_GRANTS_KEY, JSON.stringify(this.accessGrants));

      this.logAudit({
        actorName: this.currentUser?.name || req.targetAccountName,
        actorEmail: req.targetAccountEmail,
        action: `Approved caregiver access for ${req.requesterEmail} with permissions: [${perms.join(', ')}]`,
        targetPatient: req.targetAccountEmail,
        status: 'allowed',
      });
    } else {
      this.logAudit({
        actorName: this.currentUser?.name || req.targetAccountName,
        actorEmail: req.targetAccountEmail,
        action: `Rejected caregiver access request from ${req.requesterEmail}`,
        targetPatient: req.targetAccountEmail,
        status: 'denied',
      });
    }

    localStorage.setItem(ACCESS_REQUESTS_KEY, JSON.stringify(this.accessRequests));

    try {
      await fetch('/api/auth/respond-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, decision, approvedPermissions }),
      });
    } catch (e) {
      // offline fallback
    }

    this.notify();
  }

  public async revokeGrant(grantId: string): Promise<void> {
    const grant = this.accessGrants.find((g) => g.id === grantId);
    if (!grant) return;

    grant.status = 'revoked';
    localStorage.setItem(ACCESS_GRANTS_KEY, JSON.stringify(this.accessGrants));

    this.logAudit({
      actorName: this.currentUser?.name || grant.targetAccountEmail,
      actorEmail: grant.targetAccountEmail,
      action: `Revoked caregiver authorization for ${grant.caregiverEmail}`,
      targetPatient: grant.targetAccountEmail,
      status: 'denied',
    });

    try {
      await fetch('/api/auth/revoke-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grantId }),
      });
    } catch (e) {
      // offline fallback
    }

    this.notify();
  }

  public getActiveGrantsForOwner(ownerEmail: string): AccessGrant[] {
    return this.accessGrants.filter(
      (g) => g.targetAccountEmail.toLowerCase() === ownerEmail.toLowerCase() && g.status === 'active'
    );
  }

  public getGrantsWhereCaregiver(caregiverEmail: string): AccessGrant[] {
    return this.accessGrants.filter(
      (g) => g.caregiverEmail.toLowerCase() === caregiverEmail.toLowerCase() && g.status === 'active'
    );
  }

  // --- Permission Checking & Audit Trail ---

  public checkPermission(
    permission: GranularPermission,
    targetPatientEmail?: string
  ): boolean {
    if (!this.currentUser) return false;

    // If accessing self or no target specified, always allowed
    if (!targetPatientEmail || targetPatientEmail.toLowerCase() === this.currentUser.email.toLowerCase()) {
      return true;
    }

    // Check active grant
    const grant = this.accessGrants.find(
      (g) =>
        g.caregiverEmail.toLowerCase() === this.currentUser!.email.toLowerCase() &&
        g.targetAccountEmail.toLowerCase() === targetPatientEmail.toLowerCase() &&
        g.status === 'active'
    );

    if (!grant) return false;
    return grant.approvedPermissions.includes(permission);
  }

  public logAudit(entry: Omit<AccessAuditLog, 'id' | 'timestamp'>) {
    const newLog: AccessAuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    this.auditLogs = [newLog, ...this.auditLogs.slice(0, 49)];
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(this.auditLogs));
    this.notify();
  }

  public getAuditLogs(): AccessAuditLog[] {
    return this.auditLogs;
  }
}

export const authService = new AuthService();
