
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';

// This is a mock auth service
type User = {
  id: string;
  username: string;
  trustLevel: 'Newcomer' | 'Contributor' | 'Expert';
  points: number;
  isOrganization: boolean;
  walletAddress?: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string, isOrganization: boolean) => Promise<void>;
  handlePrivyLogin: () => void;
  addPoints: (points: number) => void;
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

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('labsmarket_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handlePrivyLogin = () => {
    // Create a mock user for demo purposes
    const mockUser: User = {
      id: `user_${Date.now()}`,
      username: `user_${Date.now().toString().slice(-4)}`,
      trustLevel: 'Newcomer',
      points: 0,
      isOrganization: false,
    };
    
    setUser(mockUser);
    localStorage.setItem('labsmarket_user', JSON.stringify(mockUser));
    toast({
      title: "Authentication successful",
      description: "Welcome to LabsMarket.ai!",
    });
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
  
  const addPoints = (points: number) => {
    if (user) {
      let newTrustLevel: 'Newcomer' | 'Contributor' | 'Expert' = 'Newcomer';
      const totalPoints = user.points + points;
      
      if (totalPoints > 1000) {
        newTrustLevel = 'Expert';
      } else if (totalPoints > 500) {
        newTrustLevel = 'Contributor';
      }
      
      const updatedUser: User = { 
        ...user, 
        points: totalPoints,
        trustLevel: newTrustLevel
      };
      
      setUser(updatedUser);
      localStorage.setItem('labsmarket_user', JSON.stringify(updatedUser));
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
        addPoints,
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
