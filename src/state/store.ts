import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './rootSaga';
import { rootReducer } from './rootReducer';
import { configureApiAuth } from '@/apis/core/apiAuthConfig';
import { selectAccessToken } from '@/features/auth/redux/auth.selectors';
import { logoutSucceeded, setAccessToken } from '@/features/auth/redux/auth.slice';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

configureApiAuth({
  getAccessToken: () => selectAccessToken(store.getState()),
  onAccessTokenRefreshed: (accessToken) => {
    store.dispatch(setAccessToken(accessToken));
  },
  onRefreshFailed: () => {
    store.dispatch(logoutSucceeded());
  },
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
