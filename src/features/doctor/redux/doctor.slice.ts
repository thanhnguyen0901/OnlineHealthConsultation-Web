import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialDoctorState } from './doctor.state';
import type { DoctorQuestion, Schedule } from '../types';

const doctorSlice = createSlice({
  name: 'doctor',
  initialState: initialDoctorState,
  reducers: {
    loadQuestionsRequested: (state) => {
      state.loading = true;
    },
    loadQuestionsSucceeded: (state, action: PayloadAction<DoctorQuestion[]>) => {
      state.loading = false;
      state.questions = action.payload;
    },
    loadQuestionsFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    answerQuestionRequested: (
      state,
      _action: PayloadAction<{ questionId: string; answer: string }>
    ) => {
      state.loading = true;
    },
    answerQuestionSucceeded: (state, action: PayloadAction<{ questionId: string }>) => {
      state.loading = false;
      state.questions = state.questions.filter((q) => q.id !== action.payload.questionId);
    },
    answerQuestionFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadScheduleRequested: (state) => {
      state.loading = true;
    },
    loadScheduleSucceeded: (state, action: PayloadAction<Schedule[]>) => {
      state.loading = false;
      state.schedules = action.payload;
    },
    loadScheduleFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loadQuestionsRequested,
  loadQuestionsSucceeded,
  loadQuestionsFailed,
  answerQuestionRequested,
  answerQuestionSucceeded,
  answerQuestionFailed,
  loadScheduleRequested,
  loadScheduleSucceeded,
  loadScheduleFailed,
} = doctorSlice.actions;

export default doctorSlice.reducer;
