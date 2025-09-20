import PortableTextComponent from "@/components/blog/PortableTextComponent";
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Metadata generation for SEO and social media sharing
export async function generateMetadata({
  params: rawParams,
}: {
  params: Promise<Params>;
}) {
  const params = await rawParams;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    metadataBase: new URL("https://insilicology.org"),
    title: `${post.title} | Insilicology`,
    description: post.metaDescription,
    keywords: post.metaKeywords?.join(", "),
    openGraph: {
      title: post.title,
      images: [{ url: post.mainImage }],
      description: post.metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      images: [{ url: post.mainImage }],
      description: post.metaDescription,
    },
    alternates: {
      canonical: `/blog/${post.slug.current}`,
    },
  };
}

async function getPostBySlug(slug: string) {
  const { data: post } = await sanityFetch({
    query: POST_QUERY,
    params: { slug },
  });
  return post;
}

async function getPosts() {
  const { data: blogs } = await sanityFetch({
    query: `*[_type == "post"]{slug}`,
  });
  return blogs;
}

type Params = {
  slug: string;
};

// Sanity query to fetch the blog post by slug
const POST_QUERY = defineQuery(`*[ _type == "post" && slug.current == $slug ][0]{
  title,
  "authorName": author->name,
  "authorImage": author->image.asset->url,
  "mainImage": coalesce(mainImage.asset->url, "/images/default-placeholder.png"),
  "imageAlt": coalesce(mainImage.alt, "Default Alt Text"),
  body,
  publishedAt,
  "categories": categories[]->title,
  "tags": tags[]->name,
  readingTime,
  metaDescription,
  metaKeywords,
  slug
}`);

// Main blog post page component
export default async function BlogPostPage({
  params: rawParams,
}: {
  params: Promise<Params>;
}) {
  const params = await rawParams;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  await getPosts(); // Optional: If you’re using it for navigation or other purposes.

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Categories */}
      <div className="mb-6">
      {post.categories?.map((category: string, idx: number) => (
        <span
            key={idx}
            className="inline-block px-4 py-2 text-sm font-bold text-white bg-black rounded-xl"
        >
            {category}
        </span>
        ))}
      </div>

      {/* Main Image */}
      {post.mainImage && (
        <div className="relative mb-8">
          <Image
            src={post.mainImage}
            alt={post.imageAlt || "Default Alt Text"}
            width={1280}
            height={720}
            className="object-cover w-full h-96 rounded-xl"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{post.title}</h1>

      {/* Author Info */}
      <div className="flex items-center space-x-3 mb-6">
        <Image
          src={post.authorImage || "/icons/user.svg"}
          alt={post.authorName || "Author"}
          width={40}
          height={40}
          className="rounded-full border border-gray-300"
        />
        <div>
          <p className="text-sm font-bold text-gray-800">{post.authorName}</p>
          <p className="text-sm text-gray-500">
            {new Date(post.publishedAt).toLocaleDateString()} -{" "}
            <b>{post.readingTime} min read</b>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="prose prose-lg text-gray-700 mb-8">
        <PortableTextComponent value={post.body} />
      </div>

      {/* Tags */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-2">Tags:</p>
        <div className="flex flex-wrap space-x-3">
          {post.tags?.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="inline-block px-4 py-2 mb-2 text-sm font-bold bg-gray-200 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Back to Blog */}
      <div className="mt-8 text-center">
        <Link
          href="/blog"
          className="inline-block px-6 py-3 font-semibold text-white bg-black rounded-xl hover:bg-gray-800 transition duration-300"
        >
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}
