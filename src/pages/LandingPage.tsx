import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/landing/ScrollProgress';
import Hero from '@/landing/Hero';
import Logos from '@/landing/Logos';
import Benefits from '@/landing/Benefits';
import HowItWorks from '@/landing/HowItWorks';
import Features from '@/landing/Features';
import Demo from '@/landing/Demo';
import Testimonials from '@/landing/Testimonials';
import FAQ from '@/landing/FAQ';
import Pricing from '@/landing/Pricing';
import CTA from '@/landing/CTA';

export default function LandingPage() {
  return (
    <div className="relative">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <Logos />
      <Benefits />
      <HowItWorks />
      <Features />
      <Demo />
      <Testimonials />
      <FAQ />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
