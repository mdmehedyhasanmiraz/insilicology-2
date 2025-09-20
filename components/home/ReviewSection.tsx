import UserReviewsMarquee from "@/components/auth/UserReviewsMarquee";

export default function ReviewSection() {
  return (
    <div 
      className="bg-[#733bf6] px-3 py-12"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.2) 1.5px, transparent 1px)",
        backgroundSize: "15px 15px",
        backgroundPosition: "center",
      }}
    >
      <UserReviewsMarquee />
    </div>
  );
}
