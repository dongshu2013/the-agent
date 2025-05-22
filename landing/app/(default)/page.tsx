export const metadata = {
  title: 'Mysta',
  description: 'Ask anything. Automate everything.',
};

import Hero from '@/components/hero-home';
import BusinessCategories from '@/components/business-categories';
import Cta from '@/components/cta';
import Features from '@/components/features';

export default function Home() {
  return (
    <>
      <Hero />
      <BusinessCategories />
      <Features />
      <Cta />
    </>
  );
}
