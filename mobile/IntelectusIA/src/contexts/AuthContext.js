import React, { createContext, useContext, useEffect, useState } from 'react';
import * as account from '../services/session';
const Context = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function restore() {
    setLoading(true); setError('');
    try { const restored = await account.restoreSession(); setUser(restored?.user || null); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { restore(); }, []);
  return <Context.Provider value={{ user, loading, error, restore,
    login: async (...args) => { const u = await account.login(...args); setUser(u); },
    register: async (...args) => { const u = await account.register(...args); setUser(u); },
    logout: async () => { try { await account.logout(); } finally { setUser(null); } },
    updateName: async name => { setUser(await account.updateName(name)); }
  }}>{children}</Context.Provider>;
}
export const useAuth = () => useContext(Context);
