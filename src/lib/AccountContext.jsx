import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/i18n';

const AccountContext = createContext(null);
const DEFAULT_ROLE = 'buyer';

export function AccountProvider({ children }) {
  const { user: authUser, isAuthenticated, isLoadingAuth } = useAuth();
  const { locale, setLocale } = useI18n();
  const [user, setUser] = useState(authUser || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUser(authUser || null);
  }, [authUser]);

  // The user's saved language wins over the browser default once signed in.
  useEffect(() => {
    if (authUser?.language && authUser.language !== locale) setLocale(authUser.language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id, authUser?.language]);

  const roles = useMemo(() => {
    const list = Array.isArray(user?.roles) ? user.roles.filter(Boolean) : [];
    return list.length ? list : [DEFAULT_ROLE];
  }, [user]);

  const activeRole = useMemo(() => {
    if (user?.active_role && roles.includes(user.active_role)) return user.active_role;
    return roles[0];
  }, [user, roles]);

  const isAdmin = user?.role === 'admin';

  const updateAccount = useCallback(async (patch) => {
    setSaving(true);
    try {
      await base44.auth.updateMe(patch);
      setUser((prev) => ({ ...(prev || {}), ...patch }));
      return true;
    } finally {
      setSaving(false);
    }
  }, []);

  const switchRole = useCallback(
    async (role) => {
      const nextRoles = roles.includes(role) ? roles : [...roles, role];
      return updateAccount({ active_role: role, roles: nextRoles });
    },
    [roles, updateAccount]
  );

  const addRole = useCallback(
    async (role) => {
      if (roles.includes(role)) return switchRole(role);
      return updateAccount({ roles: [...roles, role], active_role: role });
    },
    [roles, switchRole, updateAccount]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: isLoadingAuth,
      roles,
      activeRole,
      isAdmin,
      saving,
      updateAccount,
      switchRole,
      addRole,
      hasRole: (role) => roles.includes(role),
      displayName: user?.full_name || user?.email?.split('@')[0] || '',
    }),
    [user, isLoadingAuth, roles, activeRole, isAdmin, saving, updateAccount, switchRole, addRole]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used inside AccountProvider');
  return ctx;
}