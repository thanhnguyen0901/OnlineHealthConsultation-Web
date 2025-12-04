import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '@/utils/storage';
import { USER_KEYS } from '@/constants/userKeys';

interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
  toasts: Array<{ id: string; severity: 'success' | 'info' | 'warn' | 'error'; summary: string; detail?: string }>;
}

const initialDarkMode = storage.get<boolean>(USER_KEYS.DARK_MODE) ?? false;

if (initialDarkMode) {
  document.documentElement.classList.add('dark');
}

const initialState: UIState = {
  darkMode: initialDarkMode,
  sidebarOpen: true,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      storage.set(USER_KEYS.DARK_MODE, state.darkMode);
      
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      storage.set(USER_KEYS.DARK_MODE, state.darkMode);
      
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    addToast: (state, action: PayloadAction<Omit<UIState['toasts'][0], 'id'>>) => {
      state.toasts.push({
        ...action.payload,
        id: Date.now().toString(),
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { toggleDarkMode, setDarkMode, toggleSidebar, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
