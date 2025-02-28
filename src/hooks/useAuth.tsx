
import { useState, useEffect, createContext, useContext } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from '@/components/ui/use-toast';

// This is a mock auth service with Privy integration
type User = {
  id: string;
  username: string;
  trustLevel: 'Newcomer' | 'Contributor' | 'Expert';
  points: number;
  isOrganization: boolean;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string, isOrganization: boolean) => Promise<void>;
  handlePrivyLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data - would be replaced with actual API calls
const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    trustLevel: 'Contributor',
    points: 350,
    isOrganization: false,
  },
  {
    id: '2',
    username: 'research_lab',
    trustLevel: 'Expert',
    points: 0,
    isOrganization: true,
  },
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { login: privyLogin, authenticated, ready, user: privyUser } = usePrivy();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('labsmarket_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // When Privy authenticates the user, update our local state
    if (ready && authenticated && privyUser) {
      // In a real implementation, you'd fetch user data from your backend
      // For now, create a basic user profile
      const newUser: User = {
        id: privyUser.id || `privy_${Date.now()}`,
        username: privyUser.email?.address || `user_${Date.now().toString().slice(-4)}`,
        trustLevel: 'Newcomer',
        points: 0,
        isOrganization: false,
      };
      
      setUser(newUser);
      localStorage.setItem('labsmarket_user', JSON.stringify(newUser));
      toast({
        title: "Authentication successful",
        description: "Welcome to LabsMarket.ai!",
      });
    }
  }, [ready, authenticated, privyUser]);

  const handlePrivyLogin = () => {
    privyLogin();
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundUser = mockUsers.find(u => u.username === username);
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      setUser(foundUser);
      localStorage.setItem('labsmarket_user', JSON.stringify(foundUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, isOrganization: boolean) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        trustLevel: 'Newcomer',
        points: 0,
        isOrganization,
      };
      
      setUser(newUser);
      localStorage.setItem('labsmarket_user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setUser(null);
      localStorage.removeItem('labsmarket_user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        handlePrivyLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
