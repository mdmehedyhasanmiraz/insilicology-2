import HeroSection from "@/components/home/HeroSection";
import UISection from "@/components/home/UISection";
import FAQSection from "@/components/home/FAQSection";
import PartnersSection from "@/components/home/PartnersSection";
import CoursesSection from "@/components/home/CoursesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import StatsSection from "@/components/home/StatsSection";

export default async function Home() {
  return (
    <main className="min-h-screen bg-white relative">
      <HeroSection />
      <StatsSection />
      <CoursesSection />
      <TestimonialsSection />
      <UISection />
      <PartnersSection />
      <FAQSection />
    </main>
  );
}
