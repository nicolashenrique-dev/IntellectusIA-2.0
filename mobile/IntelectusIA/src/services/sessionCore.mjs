// Pure session policy, also exercised without a device in the regression tests.
export function createSessionStore(storage) {
  let current = null;
  let remembered = false;
  let revision = 0;
  let writes = Promise.resolve();
  const write = action => { writes = writes.catch(() => {}).then(action); return writes; };
  return {
    current: () => current,
    revision: () => revision,
    async establish(session, remember = false) {
      const version = ++revision;
      await write(() => remember ? storage.set(session.refreshToken) : storage.clear());
      if (version !== revision) return;
      current = session; remembered = remember;
    },
    async restore(validate) {
      const credential = await storage.get();
      if (!credential) return null;
      const version = revision;
      try {
        const verified = await validate(credential);
        if (revision !== version) return current;
        await this.establish(verified, true);
        return current;
      } catch (error) {
        // Network failures should not delete a valid remembered credential.
        if (error.invalidSession && revision === version) await write(() => storage.clear());
        throw error;
      }
    },
    async renew(session, version) {
      if (version !== revision || !current) return false;
      if (remembered) await write(() => storage.set(session.refreshToken));
      if (version !== revision) return false;
      current = session;
      return true;
    },
    async clear() { revision++; current = null; remembered = false; await write(() => storage.clear()); }
  };
}
