import CancelPage from "@/components/CancelPage";
import ogImage from "@/public/opengraph-image.webp";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Payment Canceled",
	description: "Your payment has been canceled. If this was done by mistake, please try again. Contact our support team.",
	keywords: [
		"Payment Canceled",
		"অনলাইন পেমেন্ট",
		"Online Payment",
		"Online Learning",
		"IT Course",
		"মার্কেটিং কোর্স",
		"বাংলাদেশ",
		"অনলাইন ইনস্টিটিউট"
	],
	openGraph: {
		title: "Payment Canceled",
		description: "Your payment has been canceled. If this was done by mistake, please try again. Contact our support team.",
		type: "website",
		locale: "bn_BD",
		siteName: "Insilicology Cancel Page",
		images: [
			{
				url: ogImage.src,
				width: 1200,
				height: 630,
				alt: "Payment Canceled - Insilicology"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "Payment Canceled",
		description: "Your payment has been canceled. If this was done by mistake, please try again. Contact our support team.",
		images: ["https://insilicology.org/opengraph-image.webp"]
	},
	robots: {
		index: false,
		follow: true
	},
	alternates: {
		canonical: "/cancel"
	}
};

export default function CancelPageWrapper() {
	return <CancelPage />;
}