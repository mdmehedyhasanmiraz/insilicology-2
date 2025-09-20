export interface WorkshopForm {
  title: string;
  slug: string;
  description: string;
  full_content: string;
  tags: string[];
  speaker_name: string;
  speaker_bio: string;
  price_regular: number;
  price_offer: number;
  price_earlybirds?: number;
  earlybirds_count?: number;
  capacity: number;
  start_time: string;
  end_time: string;
  status: string;
  banner_image_path: string;
  youtube_url: string;
  group_link: string;
  category?: string;
}

export interface Workshop {
  id: string;
  title: string;
  slug: string;
  description: string;
  full_content: string;
  tags: string[];
  speaker_name: string;
  speaker_bio: string;
  price_regular: number;
  price_offer: number;
  price_earlybirds?: number;
  earlybirds_count?: number;
  capacity: number;
  start_time: string;
  end_time: string;
  status: string;
  banner_image_path: string;
  youtube_url?: string;
  group_link?: string;
}