'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Role } from '@/types/api';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login';

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        if (isAuthPage) {
          router.push('/');
        }
      } else if (!isAuthPage) {
        router.push('/login');
      }
    } catch (e) {
      console.error("Auth init error:", e);
      if (!isAuthPage) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathname, isAuthPage, router]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // If we are on public page or we have user
  if (isAuthPage || user) {
    return (
      <AuthContext.Provider value={{ user, isLoading, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return null;
}
