import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "@/services/authService";
import { AuthData, LoginRequest } from "@/types/auth";

interface AuthState {
  user: AuthData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

// Thunk cho Login
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(data);
      // Lưu token vào localStorage nếu cần
      localStorage.setItem("accessToken", response.data.accessToken);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("accessToken");
    },

    setAuthFromOAuth: (state, action: { payload: { accessToken: string; user?: Partial<AuthData> } }) => {
      const { accessToken, user } = action.payload;
      localStorage.setItem("accessToken", accessToken);
      state.user = {
        userId: "",
        userName: "",
        fullName: "",
        avatarUrl: "",
        role: "",
        tokenType: "Bearer",
        ...user,
        accessToken,
      } as AuthData;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setAuthFromOAuth } = authSlice.actions;
export default authSlice.reducer;