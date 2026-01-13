import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

// Mock auth functions using localStorage only
const mockAuthService = {
  getCurrentUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', 'mock_token_' + Date.now());
  },
  clearUser: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = mockAuthService.getCurrentUser();
    if (currentUser && mockAuthService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (loginData) => {
    try {
      // Mock login - just create a user based on login type
      let mockUser = {
        id: 'user_' + Date.now(),
        role: 'user',
        createdAt: new Date().toISOString()
      };

      if (loginData.type === 'phone') {
        if (loginData.step === 'initiate') {
          // Just return success for OTP initiation
          return { success: true, message: 'OTP sent (mock)' };
        } else if (loginData.step === 'verify') {
          mockUser.phone = loginData.phone;
          mockUser.college = loginData.college || 'CBIT';
          mockAuthService.setUser(mockUser);
          setUser(mockUser);
          return { success: true, user: mockUser };
        }
      } else if (loginData.type === 'google') {
        mockUser.email = 'user@gmail.com';
        mockUser.name = 'Google User';
        mockAuthService.setUser(mockUser);
        setUser(mockUser);
        return { success: true, user: mockUser };
      } else if (loginData.type === 'college') {
        if (loginData.step === 'initiate') {
          return { success: true, message: 'Verification email sent (mock)' };
        } else if (loginData.step === 'verify') {
          mockUser.email = loginData.email;
          mockAuthService.setUser(mockUser);
          setUser(mockUser);
          return { success: true, user: mockUser };
        }
      }

      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      mockAuthService.clearUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
