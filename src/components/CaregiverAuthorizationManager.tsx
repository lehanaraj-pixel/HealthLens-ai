import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  Lock,
  HeartHandshake,
  Check,
  X,
  Send,
  Eye,
  Trash2,
} from 'lucide-react';
import { useI18n } from '../services/i18n';
import { authService } from '../services/auth';
import { AccessRequest, AccessGrant, AccessAuditLog, GranularPermission } from '../types';

interface CaregiverAuthorizationManagerProps {
  onOpenRequestAccessModal?: () => void;
}

export const CaregiverAuthorizationManager: React.FC<CaregiverAuthorizationManagerProps> = ({
  onOpenRequestAccessModal,
}) => {
  const { language } = useI18n();
  const currentUser = authService.getCurrentUser();

  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AccessAuditLog[]>([]);
  const [selectedPermissionsMap, setSelectedPermissionsMap] = useState<Record<string, GranularPermission[]>>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const reloadData = () => {
    const userEmail = currentUser?.email || 'rajesh.sharma@healthlens.com';
    const reqs = authService.getRequestsForAccount(userEmail);
    const g = authService.getActiveGrantsForOwner(userEmail);
    const logs = authService.getAuditLogs();

    setRequests(reqs);
    setGrants(g);
    setAuditLogs(logs);

    // Initialize custom permissions map for pending requests
    const initPerms: Record<string, GranularPermission[]> = {};
    reqs.forEach((r) => {
      initPerms[r.id] = r.requestedPermissions;
    });
    setSelectedPermissionsMap(initPerms);
  };

  useEffect(() => {
    reloadData();
    const unsub = authService.subscribe(() => reloadData());
    return () => {
      unsub();
    };
  }, [currentUser]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleTogglePerm = (reqId: string, perm: GranularPermission) => {
    setSelectedPermissionsMap((prev) => {
      const current = prev[reqId] || [];
      const updated = current.includes(perm)
        ? current.filter((p) => p !== perm)
        : [...current, perm];
      return { ...prev, [reqId]: updated };
    });
  };

  const handleApprove = async (req: AccessRequest) => {
    const permsToGrant = selectedPermissionsMap[req.id] || req.requestedPermissions;
    if (permsToGrant.length === 0) {
      alert('Please select at least one permission to grant.');
      return;
    }
    await authService.respondToRequest(req.id, 'approve', permsToGrant);
    showNotice(
      language === 'hi'
        ? `${req.requesterName} के लिए केयरगिवर एक्सेस स्वीकृत किया गया।`
        : `Approved caregiver access for ${req.requesterName}.`
    );
  };

  const handleReject = async (req: AccessRequest) => {
    await authService.respondToRequest(req.id, 'reject');
    showNotice(
      language === 'hi'
        ? `${req.requesterName} का अनुरोध अस्वीकृत कर दिया गया।`
        : `Rejected request from ${req.requesterName}.`
    );
  };

  const handleRevoke = async (grant: AccessGrant) => {
    await authService.revokeGrant(grant.id);
    showNotice(
      language === 'hi'
        ? `${grant.caregiverName} का एक्सेस निरस्त (revoke) कर दिया गया।`
        : `Revoked access for ${grant.caregiverName}.`
    );
  };

  const PERMISSION_LABELS: Record<GranularPermission, { en: string; hi: string }> = {
    view_reports: { en: 'View medical reports', hi: 'मेडिकल रिपोर्ट देखें' },
    view_prescriptions: { en: 'View prescription information', hi: 'प्रिस्क्रिप्शन जानकारी देखें' },
    manage_reminders: { en: 'Manage health reminders', hi: 'स्वास्थ्य अनुस्मारक प्रबंधित करें' },
    view_history: { en: 'View health history', hi: 'स्वास्थ्य इतिहास देखें' },
    view_tracker: { en: 'View prescription tracker', hi: 'प्रिस्क्रिप्शन ट्रैकर देखें' },
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-teal-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Section 1: Pending Authorization Requests */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'hi' ? 'आने वाले केयरगिवर एक्सेस अनुरोध' : 'Pending Caregiver Access Requests'}</span>
                {pendingRequests.length > 0 && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    {pendingRequests.length} New
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? 'खाता स्वामी के रूप में आपके अनुमोदन की प्रतीक्षा कर रहे अनुरोध'
                  : 'Requires your explicit approval before any health records can be viewed'}
              </p>
            </div>
          </div>

          {onOpenRequestAccessModal && (
            <button
              onClick={onOpenRequestAccessModal}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? '+ नया अनुरोध भेजें' : '+ Request Access'}</span>
            </button>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 text-center text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'कोई लंबित अनुरोध नहीं है। आपका खाता पूरी तरह निजी है।'
              : 'No pending caregiver authorization requests. Your health data is strictly private.'}
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => {
              const currentSelected = selectedPermissionsMap[req.id] || req.requestedPermissions;

              return (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-800/80 bg-amber-50/30 dark:bg-amber-950/20 space-y-3.5"
                >
                  {/* Requester Info Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/60 dark:border-amber-800/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {req.requesterName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {req.requesterEmail}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Requested {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 self-start sm:self-auto">
                      Awaiting Your Approval
                    </span>
                  </div>

                  {/* Purpose of Access */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                      Purpose of Access:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      "{req.purpose}"
                    </p>
                  </div>

                  {/* Granular Permissions Selection (Account Owner Chooses what to Grant) */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Select Granular Permissions to Grant:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(Object.keys(PERMISSION_LABELS) as GranularPermission[]).map((permKey) => {
                        const isChecked = currentSelected.includes(permKey);
                        const isRequested = req.requestedPermissions.includes(permKey);

                        return (
                          <label
                            key={permKey}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePerm(req.id, permKey)}
                              className="rounded text-teal-600 focus:ring-teal-500"
                            />
                            <span>{language === 'hi' ? PERMISSION_LABELS[permKey].hi : PERMISSION_LABELS[permKey].en}</span>
                            {isRequested && (
                              <span className="text-[9px] text-amber-600 dark:text-amber-400 ml-auto font-normal">
                                Requested
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* APPROVE & REJECT BUTTONS */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleReject(req)}
                      className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 hover:bg-rose-50 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject Request</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(req)}
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Approve with Selected Permissions</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Active Authorized Caregivers & Revoke Access */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {language === 'hi' ? 'सक्रिय अधिकृत केयरगिवर (Active Caregivers)' : 'Active Authorized Caregivers'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'जिन व्यक्तियों को आपने अपने स्वास्थ्य डेटा को देखने की अनुमति दी है।'
                : 'Users who hold verified granular permissions to view your health data. You can revoke access at any time.'}
            </p>
          </div>
        </div>

        {grants.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 text-center text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'वर्तमान में कोई अन्य व्यक्ति इस खाते से जुड़ा हुआ नहीं है।'
              : 'No external caregivers currently have access to this account.'}
          </div>
        ) : (
          <div className="space-y-3">
            {grants.map((grant) => (
              <div
                key={grant.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-slate-900 dark:text-white">
                      {grant.caregiverName}
                    </strong>
                    <span className="text-[10px] font-mono text-slate-500">
                      {grant.caregiverEmail}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {grant.approvedPermissions.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200"
                      >
                        ✓ {PERMISSION_LABELS[p] ? (language === 'hi' ? PERMISSION_LABELS[p].hi : PERMISSION_LABELS[p].en) : p}
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] text-slate-400 block">
                    Granted on {new Date(grant.grantedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Revoke Access Button */}
                <button
                  type="button"
                  onClick={() => handleRevoke(grant)}
                  className="px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke Access</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Access History & Audit Trail */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
            <History className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {language === 'hi' ? 'एक्सेस इतिहास एवं ऑडिट लॉग' : 'Account Access History & Audit Trail'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'यह रिकॉर्ड दिखाता है कि किसने, कब और किस अनुमति के तहत आपके खाते को देखा।'
                : 'Verifiable chronological record showing who accessed the account and when.'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">User / Actor</th>
                <th className="p-3">Action Performed</th>
                <th className="p-3">Target Patient</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {log.actorName}
                    <div className="text-[10px] text-slate-400 font-mono">{log.actorEmail}</div>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{log.action}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px]">{log.targetPatient}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                    {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.status === 'allowed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
