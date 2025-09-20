import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-[family-name:var(--font-hind-siliguri)] text-black bg-white">
      <Header />
      <main className="">
        {children}
      </main>
      <Footer />
    </div>
  );
}