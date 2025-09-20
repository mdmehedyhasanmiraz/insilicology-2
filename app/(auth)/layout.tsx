// app/(auth)/layout.tsx

export const metadata = {
  title: "Auth",
  description:
    "Login or register to Insilicology.",
  keywords: [
    "auth",
    "insilicology",
    "insilicology auth",
    "insilicology auth page",
    "insilicology auth page",
  ],
  metadataBase: new URL("https://insilicology.org"),
  alternates: {
    canonical: `/`,
  },
};
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-[family-name:var(--font-hind-siliguri)] text-black bg-white h-screen">
      {children}
    </div>
  );
}
