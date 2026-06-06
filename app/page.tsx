import { Section1Hero } from '@/components/landing/Section1Hero';
import { Section2Rotation } from '@/components/landing/Section2Rotation';
import { Section3HowItWorks } from '@/components/landing/Section3HowItWorks';
import { Section4Gallery } from '@/components/landing/Section4Gallery';
import { Section5Photo } from '@/components/landing/Section5Photo';
import { Section6Final } from '@/components/landing/Section6Final';

export default function HomePage() {
  return (
    <main>
      <Section1Hero />
      <Section2Rotation />
      <Section3HowItWorks />
      <Section4Gallery />
      <Section5Photo />
      <Section6Final />
    </main>
  );
}
