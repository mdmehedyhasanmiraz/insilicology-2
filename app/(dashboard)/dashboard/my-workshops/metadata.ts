import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Workshops - Dashboard - Skilltori',
  description: 'View and manage your enrolled workshops. Access workshop materials, join live sessions, and track your progress.',
  openGraph: {
    title: 'My Workshops - Dashboard - Skilltori',
    description: 'View and manage your enrolled workshops. Access workshop materials, join live sessions, and track your progress.',
    type: 'website',
    url: 'https://skilltori.com/dashboard/my-workshops',
    images: [
      {
        url: 'https://skilltori.com/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Skilltori Dashboard - My Workshops',
      }
    ],
    siteName: 'Skilltori',
    locale: 'bn_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Workshops - Dashboard - Skilltori',
    description: 'View and manage your enrolled workshops. Access workshop materials, join live sessions, and track your progress.',
    images: ['https://skilltori.com/opengraph-image.png'],
  },
  alternates: {
    canonical: 'https://skilltori.com/dashboard/my-workshops',
  },
};
