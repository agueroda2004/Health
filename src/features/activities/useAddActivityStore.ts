import { create } from "zustand";

type Tab = "run" | "ride";

type AddActivityState = {
  isOpen: boolean;
  tab: Tab;
  open: (tab: Tab) => void;
  close: () => void;
};

export const useAddActivityStore = create<AddActivityState>((set) => ({
  isOpen: false,
  tab: "run",
  open: (tab) => set({ isOpen: true, tab }),
  close: () => set({ isOpen: false }),
}));