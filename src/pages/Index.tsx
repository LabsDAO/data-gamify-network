
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, Database, Award, Shield, BarChart3 } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      title: 'Upload Data',
      description: 'Securely upload images, audio, and video files to contribute to AI advancement.',
      icon: Upload,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Preprocess Data',
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
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container mx-auto">
        {/* Hero Section */}
        <section 
          className={cn(
            "flex flex-col items-center text-center mb-20 transition-all duration-1000 transform",
            isVisible ? "opacity-100" : "opacity-0 translate-y-10"
          )}
        >
          <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm animate-pulse-subtle">
            EthDenver Hackathon 2024
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl leading-tight md:leading-tight lg:leading-tight">
            <span className="text-gradient">LabsMarket.ai</span> <br />
            Where Real Effort Meets Reward
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8">
            A decentralized platform connecting trusted individuals worldwide to collect and preprocess data for AI improvement, 
            with transparent incentives and IP monetization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate(user ? '/dashboard' : '/dashboard')} 
              className="px-8 py-3 bg-primary text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
            >
              {user ? 'Go to Dashboard' : 'Get Started'} 
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/leaderboard')}
              className="px-8 py-3 bg-secondary text-foreground rounded-full font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all"
            >
              View Leaderboard
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform empowers contributors and organizations with powerful tools and features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <section className="text-center">
          <GlassMorphismCard 
            className="max-w-4xl mx-auto"
            gradient={true}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to contribute and earn rewards?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our community of trusted contributors and start monetizing your data while advancing AI technology.
            </p>
            <button 
              onClick={() => navigate(user ? '/dashboard' : '/dashboard')}
              className="px-8 py-3 bg-primary text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all mx-auto shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
            >
              {user ? 'Go to Dashboard' : 'Join Now'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </GlassMorphismCard>
        </section>
      </div>
    </div>
  );
};

export default Index;
