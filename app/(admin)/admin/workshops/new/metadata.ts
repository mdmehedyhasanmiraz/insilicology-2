import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Workshop - Admin - Skilltori',
  description: 'Create a new workshop with title, description, pricing, and banner image. Admin panel for workshop management.',
  openGraph: {
    title: 'Create New Workshop - Admin - Skilltori',
    description: 'Create a new workshop with title, description, pricing, and banner image. Admin panel for workshop management.',
    type: 'website',
    url: 'https://skilltori.com/admin/workshops/new',
    images: [
      {
        url: 'https://skilltori.com/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Skilltori Admin - Create Workshop',
      }
    ],
    siteName: 'Skilltori',
    locale: 'bn_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create New Workshop - Admin - Skilltori',
    description: 'Create a new workshop with title, description, pricing, and banner image. Admin panel for workshop management.',
    images: ['https://skilltori.com/opengraph-image.png'],
  },
  alternates: {
    canonical: 'https://skilltori.com/admin/workshops/new',
  },
};
