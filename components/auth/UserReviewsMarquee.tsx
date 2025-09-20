import Marquee from "react-fast-marquee";
import Image from "next/image";

const reviews = [
  {
    name: "Md Abdullah Al Mamun",
    role: "Engineering Student, Dhaka",
    image: "/images/reviewer-1.webp",
    text: "⭐️⭐️⭐️⭐️⭐️ Insilicology made learning fun and easy. Perfect for beginners!",
  },
  {
    name: "Tanvir Hasan",
    role: "Freelancer, Dhaka",
    image: "/images/reviewer-2.webp",
    text: "I got my first freelance job after completing a course here. Game changer!",
  },
  {
    name: "Md. Ashikur Rahman",
    role: "B.A. Graduate, Chattogram",
    image: "/images/reviewer-3.webp",
    text: "The lessons are in Bengali and super clear. Finally something made for us.",
  },
  {
    name: "Saikat",
    role: "Aspiring Developer",
    image: "/images/reviewer-4.webp",
    text: "Affordable, local, and actually useful. Insilicology nailed it.",
  },
  {
    name: "Farhan Mollah",
    role: "UX Intern",
    image: "/images/reviewer-5.webp",
    text: "Short videos, real skills. Best platform I’ve used in a while.",
  },
  {
    name: "Jahidul Islam",
    role: "SSC",
    image: "/images/reviewer-6.webp",
    text: "Love the content quality and the no-fluff teaching style.",
  },
];

export default function UserReviewsMarquee() {
  return (
    <div className="py-6 px-4 w-full space-y-4">
      {[false, true].map((reverse, i) => (
        <Marquee
          key={i}
          gradient={true}
          gradientColor="#733bf6"
          speed={40}
          pauseOnHover={false}
          direction={reverse ? "right" : "left"}
        >
          {reviews.map((review, index) => (
            <div
              key={index}
              className="m-4 bg-white rounded-2xl shadow-lg px-6 py-5 text-sm text-gray-800 min-w-[300px] max-w-sm flex flex-col space-y-3"
            >
              <p className="text-gray-700">{review.text}</p>
              <div className="flex items-center space-x-3 mt-2">
                <Image
                  src={review.image}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover"
                  width={40}
                  height={40}
                />
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-xs text-gray-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      ))}
    </div>
  );
}
