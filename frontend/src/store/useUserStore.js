import create from 'zustand'

export const useUserStore = create((set) => ({
  user: null,
  balance: 0,
  isLoading: true,
  error: null,

  setUser:    (u) => set({ user: u }),
  setBalance: (b) => set({ balance: b }),
  setLoading: (v) => set({ isLoading: v }),
  setError:   (e) => set({ error: e })
}))
