import { HeroSection } from "@/components/sections/HeroSection";
import { ProductionEngineSection } from "@/components/sections/ProductionEngineSection";
import { CauseEffectSection } from "@/components/sections/CauseEffectSection";
import { ProductModulesSection } from "@/components/sections/ProductModulesSection";
import { RealProductUISection } from "@/components/sections/RealProductUISection";
import { BusinessOutcomesSection } from "@/components/sections/BusinessOutcomesSection";
import { ComparisonSection } from "@/components/sections/ComparisonSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { WaitlistSection } from "@/components/sections/WaitlistSection";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <ProductionEngineSection />
      <CauseEffectSection />
      <ProductModulesSection />
      <RealProductUISection />
      <BusinessOutcomesSection />
      <ComparisonSection />
      <TrustSection />
      <WaitlistSection />
      <Footer />
    </main>
  );
}
