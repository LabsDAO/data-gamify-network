
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import { usePrivy } from '@privy-io/react-auth';

// This is a mock auth service with Privy integration
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
  const { login: privyLogin, logout: privyLogout, authenticated, user: privyUser } = usePrivy();

  useEffect(() => {
    // Check for stored user on mount or when Privy auth state changes
    const storedUser = localStorage.getItem('labsmarket_user');
    
    if (authenticated && privyUser) {
      // If authenticated with Privy but no local user, create one
      if (!storedUser) {
        // Get wallet address from Privy user
        let walletAddress = '';
        
        // Check for linked wallets
        if (privyUser.linkedAccounts && privyUser.linkedAccounts.length > 0) {
          // Find the first wallet account
          const walletAccount = privyUser.linkedAccounts.find(
            account => account.type === 'wallet'
          );
          
          if (walletAccount && walletAccount.address) {
            walletAddress = walletAccount.address;
            console.log("Found wallet address from linked accounts:", walletAddress);
          }
        }
        
        // Fallback to the wallet property if no linked wallet found
        if (!walletAddress && privyUser.wallet && privyUser.wallet.address) {
          walletAddress = privyUser.wallet.address;
          console.log("Found wallet address from wallet property:", walletAddress);
        }
        
        const newUser: User = {
          id: privyUser.id || `user_${Date.now()}`,
          username: privyUser.email?.address ||
                   (walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` :
                   `user_${Date.now().toString().slice(-4)}`),
          trustLevel: 'Newcomer',
          points: 0,
          isOrganization: false,
          walletAddress: walletAddress,
        };
        
        setUser(newUser);
        localStorage.setItem('labsmarket_user', JSON.stringify(newUser));
        
        const welcomeMessage = walletAddress
          ? `Welcome, wallet user ${newUser.username}!`
          : `Welcome, ${newUser.username}!`;
          
        toast({
          title: "Successfully signed in",
          description: welcomeMessage,
        });
      } else {
        setUser(JSON.parse(storedUser));
      }
    } else if (!authenticated && storedUser) {
      // If user is stored but not authenticated with Privy, keep using stored user
      setUser(JSON.parse(storedUser));
    } else if (!authenticated && !storedUser) {
      // Not authenticated and no stored user
      setUser(null);
    }
    
    setIsLoading(false);
  }, [authenticated, privyUser]);

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
      toast({
        title: "Successfully signed in",
        description: `Welcome back, ${foundUser.username}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
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
      toast({
        title: "Account created",
        description: `Welcome to LabsMarket, ${username}!`,
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Logout from Privy if authenticated
      if (authenticated) {
        await privyLogout();
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setUser(null);
      localStorage.removeItem('labsmarket_user');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an issue signing out. Please try again.",
        variant: "destructive",
      });
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
      
      // Toast notification is now handled in userPointsTracker.ts
      // to avoid duplicate notifications
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
