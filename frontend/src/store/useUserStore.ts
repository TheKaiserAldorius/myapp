import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}

interface UserState {
  user: User | null;
  balance: number;
  setUser: (user: User) => void;
  setBalance: (balance: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  balance: 0,
  setUser: (user) => set({ user }),
  setBalance: (balance) => set({ balance }),
}));
