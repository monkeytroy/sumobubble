import HomePricing from '@/src/components/home-pricing';
import HomeFeatures from '@/src/components/home-features';
import HomeIntro from '@/src/components/home-intro';

export default function Home() {
  const stripe = {
    key: process.env.STRIPE_KEY || '',
    homeId: process.env.STRIPE_HOME_ID || '',
    consoleId: process.env.STRIPE_CONSOLE_ID || ''
  };

  return (
    <div className="flex flex-col gap-24">
      <div>
        <HomeIntro />
      </div>

      <div id="features">
        <HomeFeatures />
      </div>

      <div id="pricing">
        <HomePricing stripe={stripe} />
      </div>
    </div>
  );
}
