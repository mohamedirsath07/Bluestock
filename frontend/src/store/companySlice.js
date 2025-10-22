import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  companyData: null,
  setupProgress: 0,
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanyData: (state, action) => {
      state.companyData = action.payload;
      state.setupProgress = action.payload.setup_progress || 0;
    },
    updateCompanyField: (state, action) => {
      if (state.companyData) {
        state.companyData = { ...state.companyData, ...action.payload };
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearCompanyData: (state) => {
      state.companyData = null;
      state.setupProgress = 0;
    },
  },
});

export const { setCompanyData, updateCompanyField, setLoading, setError, clearCompanyData } = companySlice.actions;
export default companySlice.reducer;
