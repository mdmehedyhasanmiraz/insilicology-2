import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface StickyEnrollButtonProps {
  courseSlug: string;
  courseType: "live" | "recorded";
  price?: number;
  originalPrice?: number;
  enrolled?: boolean;
}

export default function StickyEnrollButton({
  courseSlug,
  courseType,
  price,
  originalPrice,
  enrolled = false
}: StickyEnrollButtonProps) {
  if (enrolled) {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex-1 flex items-center justify-between pr-20">
            {/* Enrolled Status */}
            <div className="flex flex-col">
              <span className="text-green-600 font-semibold text-md">
                আপনি ভর্তি হয়েছেন
              </span>
              <span className="text-sm text-gray-600">
                {courseType === "live" ? "লাইভ কোর্স" : "রেকর্ডেড কোর্স"}
              </span>
            </div>

            {/* Go to Course Button */}
            <Link href={`/dashboard/my-courses/${courseType}/${courseSlug}`}>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-lg">
                কোর্সে যান
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Price and Button Section - Leave space for WhatsApp button on right */}
        <div className="flex-1 flex items-center justify-between pr-20">
          {/* Price Display */}
          <div className="flex flex-col">
            {price && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ৳{price.toLocaleString("bn-BD")}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-sm text-gray-500 font-semibold line-through">
                      ৳{originalPrice.toLocaleString("bn-BD")}
                    </span>
                  )}
                </div>
              </div>
            )}
            <span className="text-xs text-gray-600">
              {courseType === "live" ? "লাইভ কোর্স" : "রেকর্ডেড কোর্স"}
            </span>
          </div>

          {/* Enroll Button */}
          <Link href={`/courses/${courseSlug}/enroll`}>
            <Button 
              className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-semibold text-lg"
            >
              এখনই ভর্তি হোন
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 