
import React, { useState } from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import OortCredentialsForm from '../storage/OortCredentialsForm';
import { Cog } from 'lucide-react';

const Layout = () => {
  const isMobile = useIsMobile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="fixed bottom-5 right-5 z-50">
        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="rounded-full h-12 w-12 shadow-lg">
              <Cog className="h-6 w-6" />
              <span className="sr-only">Storage Settings</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Storage Settings</SheetTitle>
            </SheetHeader>
            <div className="py-6">
              <OortCredentialsForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Add safe area padding for mobile devices with notches */}
      {isMobile && (
        <div className="h-safe-bottom min-h-[20px]"></div>
      )}
    </div>
  );
};

export default Layout;
