import React from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import AISection from '@/components/landing/AISection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AISection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;