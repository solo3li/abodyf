import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { login as reduxLogin, logout as reduxLogout, updateUserSync, setToken, fetchMe } from '../store/slices/authSlice';

interface AuthContextType {
  user: any | null;
  login: (credentials: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe());
    }
  }, [token, user]);

  const login = async (credentials: any) => {
    const result = await dispatch(reduxLogin(credentials));
    return reduxLogin.fulfilled.match(result);
  };

  const logout = () => {
    dispatch(reduxLogout());
  };

  const updateUser = (data: any) => {
    dispatch(updateUserSync(data));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
