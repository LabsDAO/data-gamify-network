
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, Database, Award, Shield, BarChart3, Bot } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePrivy } from '@privy-io/react-auth';

const Index = () => {
  const navigate = useNavigate();
  const { user, handlePrivyLogin } = useAuth();
  const { authenticated } = usePrivy();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (authenticated && user) {
      navigate('/dashboard');
    }
  }, [authenticated, user, navigate]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      handlePrivyLogin();
    }
  };

  const features = [
    {
      title: 'Upload Data',
      description: 'Securely upload images, voice recordings, or text to contribute to AI advancement.',
      icon: Upload,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Label Data',
      description: 'Add valuable metadata and annotations to improve data quality.',
      icon: Database,
      color: 'from-violet-500 to-purple-500'
    },
    {
      title: 'IP Registration',
      description: 'Register your data as intellectual property with clear licensing terms.',
      icon: Shield,
      color: 'from-emerald-500 to-green-500'
    },
    {
      title: 'AI Agents',
      description: 'Contribute to training intelligent AI agents and help them become smarter.',
      icon: Bot,
      color: 'from-indigo-500 to-blue-500'
    },
    {
      title: 'Gamification',
      description: 'Earn points, climb the leaderboard, and get recognized for your contributions.',
      icon: Award,
      color: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Analytics',
      description: 'Track your contributions and earnings over time.',
      icon: BarChart3,
      color: 'from-red-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen pt-16 md:pt-24 pb-12 md:pb-16 px-4 md:px-6">
      <div className="container mx-auto">
        {/* Hero Section */}
        <section 
          className={cn(
            "flex flex-col items-center text-center mb-12 md:mb-20 transition-all duration-1000 transform",
            isVisible ? "opacity-100" : "opacity-0 translate-y-10"
          )}
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 max-w-4xl leading-tight">
            <span className="text-gradient">AI Marketplace</span> <br />
            Where Real Effort Meets Reward
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mb-6 md:mb-8">
            A decentralized platform connecting trusted individuals worldwide to contribute to the Human AI economy, 
            with transparent incentives and IP monetization.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full justify-center">
            <button 
              onClick={handleGetStarted} 
              className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
            >
              {user ? 'Go to Dashboard' : 'Get Started'} 
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/leaderboard')}
              className="w-full sm:w-auto px-6 py-3 bg-secondary text-foreground rounded-full font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all mt-2 sm:mt-0"
            >
              View Leaderboard
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12 md:mb-24">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto px-2">
              Our platform empowers contributors and organizations with powerful tools and features.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <GlassMorphismCard 
                key={index} 
                className="h-full"
                hoverEffect={true}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-gradient-to-r",
                  feature.color
                )}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </GlassMorphismCard>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center px-2">
          <GlassMorphismCard 
            className="max-w-4xl mx-auto py-8 md:py-10 px-6 md:px-8"
            gradient={true}
          >
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
                Ready to contribute and earn rewards?
              </h2>
              <p className="text-white text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Join our community of trusted contributors and start monetizing your data 
                while advancing AI technology.
              </p>
              <div className="pt-2">
                <button 
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto px-6 py-4 bg-primary text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all mx-auto shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
                >
                  {user ? 'Go to Dashboard' : 'Join Now'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </GlassMorphismCard>
        </section>
      </div>
    </div>
  );
};

export default Index;
