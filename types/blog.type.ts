export interface Post {
  title: string;
  slug: { current: string };
  mainImage?: {
    asset?: {
      url: string;
    };
    alt?: string;
  };
  metaDescription?: string;
  publishedAt: string;
  readingTime: string;
  categories?: { title: string }[];
  author?: { 
    name: string; 
    image?: { asset: { url: string } } 
  };
  body?: string;
}

export interface TableRow {
  cells: string[];
}

export interface TableValue {
  rows: TableRow[];
}

export interface ImageValue {
  asset?: {
    url?: string;
  };
  alt?: string;
}