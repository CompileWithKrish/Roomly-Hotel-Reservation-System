import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../lib/mockData';
import { apiClient } from '../lib/apiClient';

interface AuthContextType {
  user: User | null;
  role: UserRole | 'guest';
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<User>;
  register: (name: string, email: string, password?: string, phone?: string) => Promise<User>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('roomly_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS[1];
      }
    }
    return INITIAL_USERS[1];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('roomly_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('roomly_auth_user');
    }
  }, [user]);

  // Optional background verification with backend /auth/me
  useEffect(() => {
    const token = localStorage.getItem('roomly_access_token');
    if (token) {
      apiClient.get<any>('/auth/me')
        .then((userData) => {
          if (userData && userData.email) {
            setUser({
              id: userData.id?.toString() || user?.id || 'usr-01',
              name: userData.name || user?.name || 'Guest',
              email: userData.email,
              role: (userData.role?.toLowerCase() as UserRole) || user?.role || 'customer',
              avatar: userData.avatarUrl || user?.avatar,
              phone: userData.phone || user?.phone,
            });
          }
        })
        .catch(() => {
          // Keep existing local user state
        });
    }
  }, []);

  const login = async (email: string, password?: string, targetRole?: UserRole): Promise<User> => {
    const effectivePassword = password || (email.toLowerCase().includes('admin') ? 'admin123' : 'customer123');

    try {
      const res = await apiClient.post<any>('/auth/login', {
        email,
        password: effectivePassword,
      });

      if (res && res.accessToken) {
        localStorage.setItem('roomly_access_token', res.accessToken);
        const loggedUser: User = {
          id: res.user?.id?.toString() || `usr-${Date.now()}`,
          name: res.user?.name || email.split('@')[0],
          email: res.user?.email || email,
          role: (res.user?.role?.toLowerCase() as UserRole) || (email.includes('admin') ? 'admin' : 'customer'),
          avatar: res.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          phone: res.user?.phone,
        };
        setUser(loggedUser);
        return loggedUser;
      }
    } catch (err: any) {
      console.warn('Backend login endpoint unavailable or rejected, using local fallback:', err);
    }

    // Local fallback
    await new Promise((resolve) => setTimeout(resolve, 300));
    const foundUser = INITIAL_USERS.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      return foundUser;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: targetRole || (email.includes('admin') ? 'admin' : 'customer'),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };
    setUser(newUser);
    return newUser;
  };

  const register = async (name: string, email: string, password?: string, phone?: string): Promise<User> => {
    const effectivePassword = password || 'customer123';

    try {
      const res = await apiClient.post<any>('/auth/register', {
        name,
        email,
        password: effectivePassword,
        phone: phone || '+1 (555) 000-0000',
      });

      if (res && res.accessToken) {
        localStorage.setItem('roomly_access_token', res.accessToken);
        const loggedUser: User = {
          id: res.user?.id?.toString() || `usr-${Date.now()}`,
          name: res.user?.name || name,
          email: res.user?.email || email,
          role: 'customer',
          avatar: res.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          phone: res.user?.phone || phone,
        };
        setUser(loggedUser);
        return loggedUser;
      }
    } catch (err: any) {
      console.warn('Backend registration endpoint failed, using local fallback:', err);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      phone,
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('roomly_access_token');
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'admin') {
      setUser(INITIAL_USERS[0]);
    } else {
      setUser(INITIAL_USERS[1]);
    }
  };

  const role = user ? user.role : 'guest';
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isCustomer,
        login,
        register,
        logout,
        switchRole,
      }}
    >
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
