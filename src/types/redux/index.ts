import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import type { rootReducer } from '@/state/rootReducer';

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = Dispatch<UnknownAction>;
