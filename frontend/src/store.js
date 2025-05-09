import { create } from 'zustand';

const useStore = create(set => ({
  user: null,
  balance: 0,
  setUser: (userData) => set({ user: userData }),
  setBalance: (bal) => set({ balance: bal }),
}));

export default useStore;
