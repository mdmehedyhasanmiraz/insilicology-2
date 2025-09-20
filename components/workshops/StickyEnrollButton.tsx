import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface StickyEnrollButtonProps {
  workshopSlug: string;
  price?: number;
  originalPrice?: number;
  earlybirdPrice?: number;
  earlybirdSpotsLeft?: number;
  enrolled?: boolean;
  isLive?: boolean;
  isPast?: boolean;
  youtubeUrl?: string;
}

export default function StickyEnrollButton({
  workshopSlug,
  price,
  originalPrice,
  earlybirdPrice,
  earlybirdSpotsLeft,
  enrolled = false,
  isLive = false,
  isPast = false,
  youtubeUrl
}: StickyEnrollButtonProps) {
  if (isPast) {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex-1 flex items-center justify-between pr-20">
            {/* Past Workshop Status */}
            <div className="flex flex-col">
              <span className="text-gray-600 font-semibold text-md">
                ওয়ার্কশপটি শেষ হয়ে গেছে
              </span>
              <span className="text-sm text-gray-500">
                রেকর্ডিং দেখুন
              </span>
            </div>

            {/* Watch Recording Button */}
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-lg"
              >
                রেকর্ডিং দেখুন
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (enrolled) {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex-1 flex items-center justify-between pr-20">
            {/* Enrolled Status */}
            <div className="flex flex-col">
              <span className="text-green-600 font-semibold text-md">
                আপনি জয়েন করেছেন
              </span>
              <span className="text-sm text-gray-600">
                {isLive ? "লাইভ ওয়ার্কশপ" : "শীঘ্রই শুরু হবে"}
              </span>
            </div>

            {/* Join/View Button */}
            <Link href={`/dashboard/my-workshops`}>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-lg">
                {isLive ? "যোগ দিন" : "দেখুন"}
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
            {price !== undefined && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {price === 0 ? (
                    <span className="text-2xl font-bold text-green-600">
                      ফ্রি
                    </span>
                  ) : (
                    <>
                      {/* Show early bird price if available and slots left */}
                      {earlybirdPrice && earlybirdPrice > 0 && earlybirdSpotsLeft && earlybirdSpotsLeft > 0 ? (
                        <>
                          <span className="text-2xl font-bold text-blue-600">
                            ৳{earlybirdPrice.toLocaleString("bn-BD")}
                          </span>
                          {originalPrice && originalPrice > earlybirdPrice && (
                            <span className="text-sm text-gray-500 font-semibold line-through">
                              ৳{originalPrice.toLocaleString("bn-BD")}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-gray-900">
                            ৳{price.toLocaleString("bn-BD")}
                          </span>
                          {originalPrice && originalPrice > price && (
                            <span className="text-sm text-gray-500 font-semibold line-through">
                              ৳{originalPrice.toLocaleString("bn-BD")}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            <span className="text-xs text-gray-600">
              {earlybirdPrice && earlybirdPrice > 0 && earlybirdSpotsLeft && earlybirdSpotsLeft > 0 ? (
                <span className="text-blue-600 font-medium">🎯 Earlybird - {earlybirdSpotsLeft} slots left</span>
              ) : (
                isLive ? "লাইভ ওয়ার্কশপ" : "ওয়ার্কশপ"
              )}
            </span>
          </div>

          {/* Enroll Button */}
          <Link href={`/workshops/${workshopSlug}/enroll`}>
            <Button 
              className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-semibold text-lg"
            >
              {isLive ? "এখনই যোগ দিন" : "এখনই জয়েন করুন"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 