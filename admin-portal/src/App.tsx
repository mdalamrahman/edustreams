import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Sliders, 
  CreditCard, 
  BarChart3, 
  RefreshCw, 
  Search, 
  Ban, 
  UserX, 
  UserCheck, 
  DollarSign, 
  Download, 
  Video, 
  Lock, 
  Unlock, 
  Bot, 
  Check, 
  AlertTriangle, 
  LogOut, 
  Plus, 
  Minus, 
  Layers, 
  HardDrive, 
  CheckCircle2, 
  Clock, 
  X,
  FileSpreadsheet,
  Cpu,
  KeyRound
} from 'lucide-react';
import { 
  fetchSystemRates, 
  saveSystemRates, 
  fetchAllAdminUsers, 
  moderateUserInSupabase, 
  deleteUserFromSupabase, 
  adjustUserCreditsInSupabase, 
  SystemPlatformRates, 
  AdminUserRecord 
} from './lib/supabaseAdminClient';
import confetti from 'canvas-confetti';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('aspersde_admin_auth') === 'true';
  });
  const [adminEmailInput, setAdminEmailInput] = useState<string>('admin@aspersde.com');
  const [adminKeyInput, setAdminKeyInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'users' | 'rates' | 'credits' | 'telemetry'>('users');

  // Rates State (Direct from Supabase)
  const [rates, setRates] = useState<SystemPlatformRates>({
    video_view_cost: 5.0,
    allow_video_download: true,
    video_download_cost: 10.0,
    mock_interview_cost: 50.0,
    free_pass_duration_hours: 24,
    suspended_users: [],
    banned_users: []
  });
  const [isSavingRates, setIsSavingRates] = useState<boolean>(false);
  const [rateSaveSuccess, setRateSaveSuccess] = useState<boolean>(false);

  // Users State (Direct from Supabase)
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');

  // Modals & Action States
  const [selectedUserForCredit, setSelectedUserForCredit] = useState<AdminUserRecord | null>(null);
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState<number>(100);
  const [creditAdjustmentNote, setCreditAdjustmentNote] = useState<string>('SuperAdmin loyalty bonus');
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Load all live data from Supabase (Zero browser cache)
  const loadSupabaseData = async () => {
    setIsLoadingUsers(true);
    const [fetchedRates, fetchedUsers] = await Promise.all([
      fetchSystemRates(),
      fetchAllAdminUsers()
    ]);
    setRates(fetchedRates);
    setUsers(fetchedUsers);
    setIsLoadingUsers(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSupabaseData();
    }
  }, [isAuthenticated]);

  // Handle Admin Authentication
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmailInput.trim().toLowerCase();
    
    // Allowed default superadmin credentials
    const isAllowedEmail = 
      cleanEmail === 'admin@aspersde.com' || 
      cleanEmail === 'admin@aspersde' || 
      cleanEmail.includes('mdalamrahman4') || 
      cleanEmail === 'admin@sdetube.com';

    if (isAllowedEmail) {
      sessionStorage.setItem('aspersde_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      setAuthError('Unauthorized Admin Credentials. Access restricted to authorized SuperAdmin accounts.');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('aspersde_admin_auth');
    setIsAuthenticated(false);
  };

  // Handle Saving Rates to Supabase
  const handleSaveRates = async () => {
    setIsSavingRates(true);
    const success = await saveSystemRates(rates);
    setIsSavingRates(false);
    if (success) {
      setRateSaveSuccess(true);
      setTimeout(() => setRateSaveSuccess(false), 3000);
      confetti({ particleCount: 40, spread: 50 });
    }
  };

  // Handle User Moderation Actions (Ban / Suspend / Unsuspend)
  const handleUserModeration = async (email: string, action: 'suspend' | 'unsuspend' | 'ban' | 'unban') => {
    if (!window.confirm(`Are you sure you want to ${action.toUpperCase()} ${email}?`)) return;
    setIsProcessingAction(true);
    await moderateUserInSupabase(email, action);
    await loadSupabaseData();
    setIsProcessingAction(false);
  };

  // Handle Hard Delete User
  const handleDeleteUser = async (email: string) => {
    if (!window.confirm(`⚠️ WARNING: Permanently delete user ${email} and all their progress from Supabase? This action cannot be undone.`)) return;
    setIsProcessingAction(true);
    await deleteUserFromSupabase(email);
    await loadSupabaseData();
    setIsProcessingAction(false);
  };

  // Handle Credit Adjustment
  const handleCreditAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCredit) return;
    setIsProcessingAction(true);
    await adjustUserCreditsInSupabase(selectedUserForCredit.email, creditAdjustmentAmount, creditAdjustmentNote);
    setSelectedUserForCredit(null);
    await loadSupabaseData();
    setIsProcessingAction(false);
    confetti({ particleCount: 35, spread: 45 });
  };

  // Filter Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (userStatusFilter === 'active') return !u.isSuspended && !u.isBanned;
    if (userStatusFilter === 'suspended') return u.isSuspended && !u.isBanned;
    if (userStatusFilter === 'banned') return u.isBanned;
    return true;
  });

  // Export Users CSV
  const handleExportCSV = () => {
    const headers = 'Email,Name,Created,Solved Problems,Active Mins,Wallet Balance,Status\n';
    const rows = users.map(u => {
      const status = u.isBanned ? 'BANNED' : u.isSuspended ? 'SUSPENDED' : 'ACTIVE';
      return `"${u.email}","${u.name}","${u.createdAt}",${u.solvedCount},${u.activeMinutes},${u.walletBalance},"${status}"`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aspersde_users_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // =========================================================================
  // VIEW 1: AUTHENTICATION LOCK SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">AsperSDE SuperAdmin</h1>
            <p className="text-xs text-slate-400">
              Dedicated Control Portal &bull; Direct Supabase Persistence
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Admin Email Address:</label>
              <input
                type="email"
                required
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="admin@aspersde.com or mdalamrahman4@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Master SuperAdmin Security Passkey / Token:</label>
              <input
                type="password"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                placeholder="Enter admin security passkey (optional for master)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-indigo-900/40 transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Authenticate & Enter Admin Center</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
            <HardDrive className="w-3 h-3 text-cyan-400" />
            <span>Direct Supabase Engine &bull; Zero Browser Caching</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SUPERADMIN CONTROL DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Admin Header Bar */}
      <header className="p-4 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-white tracking-tight">AsperSDE Control Center</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Supabase Live Direct</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              admin@aspersde.com &bull; SuperAdmin Authority
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadSupabaseData}
            disabled={isLoadingUsers}
            className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh Live Data from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoadingUsers ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="p-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="px-6 pt-4 bg-slate-950 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto custom-scrollbar flex-shrink-0 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-t-2xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
            activeTab === 'users'
              ? 'bg-slate-900 border-slate-800 text-indigo-400 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Moderation & Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rates')}
          className={`px-4 py-2.5 rounded-t-2xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
            activeTab === 'rates'
              ? 'bg-slate-900 border-slate-800 text-amber-400 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Rates, Pricing & Video Download Controls</span>
        </button>

        <button
          onClick={() => setActiveTab('credits')}
          className={`px-4 py-2.5 rounded-t-2xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
            activeTab === 'credits'
              ? 'bg-slate-900 border-slate-800 text-teal-400 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Manual Credit Grantor</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2.5 rounded-t-2xl transition-all cursor-pointer flex items-center space-x-2 border-t border-x ${
            activeTab === 'telemetry'
              ? 'bg-slate-900 border-slate-800 text-cyan-400 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Live Telemetry & Ledger Audit</span>
        </button>
      </div>

      {/* Body Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* ===================================================================
            TAB 1: USER DIRECTORY & MODERATION (BAN, SUSPEND, REMOVE)
            =================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-500 font-mono">Total Users in Database</span>
                <p className="text-2xl font-black text-white mt-1">{users.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono">Active Users</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {users.filter(u => !u.isSuspended && !u.isBanned).length}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-amber-400 font-mono">Suspended Users</span>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  {users.filter(u => u.isSuspended && !u.isBanned).length}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-rose-400 font-mono">Banned Users</span>
                <p className="text-2xl font-black text-rose-400 mt-1">
                  {users.filter(u => u.isBanned).length}
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by email or name..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses ({users.length})</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                  <option value="banned">Banned Only</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 px-4 font-bold">User Identity</th>
                      <th className="p-3.5 px-4 font-bold">DSA Solved</th>
                      <th className="p-3.5 px-4 font-bold">Wallet Balance</th>
                      <th className="p-3.5 px-4 font-bold">Account Status</th>
                      <th className="p-3.5 px-4 font-bold text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                          No users found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSuperAdmin = u.email.includes('mdalamrahman4') || u.email.includes('admin@aspersde');
                        return (
                          <tr key={u.id} className="hover:bg-slate-950/50 transition-colors">
                            
                            {/* User Info */}
                            <td className="p-3.5 px-4">
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{u.name}</span>
                                {isSuperAdmin && (
                                  <span className="px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[9px] font-mono">
                                    SuperAdmin
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                            </td>

                            {/* Solved Progress */}
                            <td className="p-3.5 px-4 font-mono">
                              <span className="font-bold text-indigo-300">{u.solvedCount}</span>
                              <span className="text-slate-500"> problems</span>
                            </td>

                            {/* Wallet Balance */}
                            <td className="p-3.5 px-4 font-mono font-bold text-emerald-400">
                              ₹{u.walletBalance} ({u.walletBalance} credits)
                            </td>

                            {/* Status */}
                            <td className="p-3.5 px-4">
                              {u.isBanned ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/40">
                                  BANNED
                                </span>
                              ) : u.isSuspended ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                                  SUSPENDED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                                  ACTIVE
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="p-3.5 px-4 text-right">
                              {!isSuperAdmin ? (
                                <div className="flex items-center justify-end space-x-1.5">
                                  
                                  {/* Credit Adjust */}
                                  <button
                                    onClick={() => setSelectedUserForCredit(u)}
                                    className="p-1.5 px-2.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-[11px] font-bold cursor-pointer transition-colors"
                                    title="Add / Deduct Credits"
                                  >
                                    &plus; Credits
                                  </button>

                                  {/* Suspend / Unsuspend */}
                                  {u.isSuspended ? (
                                    <button
                                      onClick={() => handleUserModeration(u.email, 'unsuspend')}
                                      className="p-1.5 px-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold cursor-pointer transition-colors"
                                      title="Restore User Access"
                                    >
                                      Unsuspend
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUserModeration(u.email, 'suspend')}
                                      className="p-1.5 px-2.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-[11px] font-bold cursor-pointer transition-colors"
                                      title="Temporarily Suspend Account"
                                    >
                                      Suspend
                                    </button>
                                  )}

                                  {/* Ban / Unban */}
                                  {u.isBanned ? (
                                    <button
                                      onClick={() => handleUserModeration(u.email, 'unban')}
                                      className="p-1.5 px-2.5 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-700/60 text-teal-300 text-[11px] font-bold cursor-pointer transition-colors"
                                    >
                                      Unban
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUserModeration(u.email, 'ban')}
                                      className="p-1.5 px-2.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[11px] font-bold cursor-pointer transition-colors"
                                      title="Permanently Ban Account"
                                    >
                                      Ban
                                    </button>
                                  )}

                                  {/* Delete User */}
                                  <button
                                    onClick={() => handleDeleteUser(u.email)}
                                    className="p-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-[11px] font-bold cursor-pointer transition-colors"
                                    title="Permanently Delete User from Database"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                  </button>

                                </div>
                              ) : (
                                <span className="text-slate-500 font-mono text-[10px]">Master Protected</span>
                              )}
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================
            TAB 2: DYNAMIC RATES & VIDEO DOWNLOAD CONTROLS
            =================================================================== */}
        {activeTab === 'rates' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Dynamic Platform Rates & Download Permissions</h3>
                    <p className="text-xs text-slate-400">
                      Modifications are written directly to Supabase with instant global effect.
                    </p>
                  </div>
                </div>

                {rateSaveSuccess && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40 flex items-center gap-1 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved in Supabase</span>
                  </span>
                )}
              </div>

              {/* Form Controls */}
              <div className="space-y-4">
                
                {/* 1. Cost per Video View */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs text-white block">Cost per Video Lecture View</span>
                    <span className="text-[11px] text-slate-400">
                      Standard fee in credits/INR charged after initial preview period.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      step={1}
                      value={rates.video_view_cost}
                      onChange={(e) => setRates({ ...rates, video_view_cost: Number(e.target.value) })}
                      className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500 text-right"
                    />
                    <span className="text-xs text-slate-400 font-mono">credits</span>
                  </div>
                </div>

                {/* 2. Master Video Download Permission Toggle */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs text-white block">Allow Video Lecture Downloads</span>
                    <span className="text-[11px] text-slate-400">
                      When enabled, students can download offline MP4 video lectures.
                    </span>
                  </div>
                  <button
                    onClick={() => setRates({ ...rates, allow_video_download: !rates.allow_video_download })}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      rates.allow_video_download
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {rates.allow_video_download ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{rates.allow_video_download ? 'Downloads Enabled' : 'Downloads Blocked'}</span>
                  </button>
                </div>

                {/* 3. Cost per Video Download */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs text-white block">Cost per Video Download</span>
                    <span className="text-[11px] text-slate-400">
                      Fee charged when student initiates an offline video download.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      step={1}
                      value={rates.video_download_cost}
                      onChange={(e) => setRates({ ...rates, video_download_cost: Number(e.target.value) })}
                      className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500 text-right"
                    />
                    <span className="text-xs text-slate-400 font-mono">credits</span>
                  </div>
                </div>

                {/* 4. Mock Interview AI Session Cost */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs text-white block">Cost per 45-Min AI Mock Interview</span>
                    <span className="text-[11px] text-slate-400">
                      Fee deducted upon launching a full FAANG Bar Raiser technical interview.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      step={5}
                      value={rates.mock_interview_cost}
                      onChange={(e) => setRates({ ...rates, mock_interview_cost: Number(e.target.value) })}
                      className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500 text-right"
                    />
                    <span className="text-xs text-slate-400 font-mono">credits</span>
                  </div>
                </div>

                {/* 5. Free 24-Hour Pass Duration */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs text-white block">Free Re-Watch Pass Duration</span>
                    <span className="text-[11px] text-slate-400">
                      Window during which re-watching an unlocked video incurs zero extra charge.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      max={720}
                      step={1}
                      value={rates.free_pass_duration_hours}
                      onChange={(e) => setRates({ ...rates, free_pass_duration_hours: Number(e.target.value) })}
                      className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500 text-right"
                    />
                    <span className="text-xs text-slate-400 font-mono">hours</span>
                  </div>
                </div>

              </div>

              {/* Save CTA */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveRates}
                  disabled={isSavingRates}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-900/30 transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingRates ? 'Writing to Supabase...' : 'Save & Publish Rates'}</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ===================================================================
            TAB 3: MANUAL CREDIT GRANTOR
            =================================================================== */}
        {activeTab === 'credits' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-4">
                <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">SuperAdmin Credit Grantor</h3>
                  <p className="text-xs text-slate-400">
                    Directly injects or deduces funds in Supabase billing ledger with audit note.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreditAdjustmentSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Recipient Student Email:</label>
                  <input
                    type="email"
                    required
                    value={selectedUserForCredit?.email || ''}
                    onChange={(e) => setSelectedUserForCredit({ ...selectedUserForCredit, email: e.target.value } as any)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Adjustment Amount (INR / Credits):</label>
                  <input
                    type="number"
                    required
                    value={creditAdjustmentAmount}
                    onChange={(e) => setCreditAdjustmentAmount(Number(e.target.value))}
                    placeholder="e.g. 500 for addition, -100 for deduction"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Audit Reason / Admin Note:</label>
                  <input
                    type="text"
                    required
                    value={creditAdjustmentNote}
                    onChange={(e) => setCreditAdjustmentNote(e.target.value)}
                    placeholder="e.g. UPI Top-up verification approved (Txn #12345)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingAction}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-teal-900/40 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isProcessingAction ? 'Processing in Supabase...' : 'Execute Credit Adjustment'}</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ===================================================================
            TAB 4: LIVE TELEMETRY & AUDIT LEDGER
            =================================================================== */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 font-mono">Cloudflare R2 Object Storage</span>
                <p className="text-2xl font-black text-cyan-400">100% Free Tier (0 Egress)</p>
                <p className="text-[11px] text-slate-400">418 Video Notes & All Interview Payloads Stored</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 font-mono">Render Backend Bandwidth</span>
                <p className="text-2xl font-black text-emerald-400">GZip Compressed</p>
                <p className="text-[11px] text-slate-400">70-85% payload reduction with 60s cache headers</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 font-mono">Supabase Auth & Database</span>
                <p className="text-2xl font-black text-indigo-400">Direct Live Sync</p>
                <p className="text-[11px] text-slate-400">Zero browser cache dependency</p>
              </div>
            </div>

            {/* Audit Log Banner */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Direct Supabase Audit Logs</h3>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full User CSV Audit</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All telemetry records, progress tracking, problem solving logs, and billing ledgers are persistently committed to the Supabase database. You can export complete CSV dumps anytime for offline reconciliation.
              </p>
            </div>

          </div>
        )}

      </main>

      {/* Credit Adjustment Modal */}
      {selectedUserForCredit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">Adjust User Credits</h3>
              <button
                onClick={() => setSelectedUserForCredit(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Adjusting wallet balance for: <span className="font-bold text-indigo-400">{selectedUserForCredit.email}</span>
            </div>

            <form onSubmit={handleCreditAdjustmentSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Credit Amount (Use negative for deduction):</label>
                <input
                  type="number"
                  required
                  value={creditAdjustmentAmount}
                  onChange={(e) => setCreditAdjustmentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Admin Note:</label>
                <input
                  type="text"
                  required
                  value={creditAdjustmentNote}
                  onChange={(e) => setCreditAdjustmentNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessingAction}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessingAction ? 'Writing to Supabase...' : 'Confirm Credit Update'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
