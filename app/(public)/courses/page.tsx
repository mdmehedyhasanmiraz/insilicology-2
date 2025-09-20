import CoursesSection from "@/components/home/CoursesSection";

export async function generateMetadata() {
  return {
    title: "All Courses",
    description: "Browse all courses offered by Insilicology, including live and recorded sessions designed to boost your skills.",
    keywords: [
      "All Courses",
      "Browse all courses",
      "Live and recorded sessions",
      "Boost your skills",
    ],
    metadataBase: new URL('https://insilicology.org'),
    alternates: {
      canonical: '/courses',
    },
    openGraph: {
      title: "All Courses",
      description: "Browse all courses offered by Insilicology, including live and recorded sessions designed to boost your skills.",
    },
    twitter: {
      card: 'summary_large_image',
      title: "All Courses",
      description: "Browse all courses offered by Insilicology, including live and recorded sessions designed to boost your skills.",
    },
  };
}

export default async function AllCoursesPage() {
  return (
    <CoursesSection />
  );
}
