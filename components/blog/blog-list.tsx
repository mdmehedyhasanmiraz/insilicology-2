"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/client";
import { calculateReadingTime } from "@/utils/blog/calculateReadingTime";
import { extractTextFromPortableText } from "@/utils/blog/extractTextFromPortableText";
import { Post } from "@/types/blog.type";

export default function BlogList() {  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedAuthor, setSelectedAuthor] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch posts from Sanity
    const fetchData = async () => {
      const query = `*[_type == "post"]{
        title,
        slug,
        mainImage{
          asset->{
            url
          },
          alt
        },
        metaDescription,
        publishedAt,
        readingTime,
        body,
        categories[]->{
          title
        },
        author->{
          name,
          image { asset->{ url } }
        }
      } | order(publishedAt desc)`;

      try {
        const sanityPosts = await sanityFetch({ query });
        setPosts(sanityPosts);

        // Extract unique authors, years, and categories for filters
        const uniqueAuthors = Array.from(
          new Set(sanityPosts.map((post: Post) => post.author?.name).filter(Boolean))
        ) as string[];
        const uniqueYears = Array.from(
          new Set(
            sanityPosts.map((post: Post) =>
              new Date(post.publishedAt).getFullYear().toString()
            )
          )
        ) as string[];
        const uniqueCategories = Array.from(
          new Set(
            sanityPosts
              .flatMap((post: Post) => post.categories?.map((cat) => cat.title))
              .filter(Boolean)
          )
        ) as string[];

        setAuthors(["All", ...uniqueAuthors]);
        setYears(["All", ...uniqueYears]);
        setCategories(["All", ...uniqueCategories]);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter posts dynamically
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" ||
      post.categories?.some((cat) => cat.title === selectedCategory);
    const matchesAuthor =
      selectedAuthor === "All" || post.author?.name === selectedAuthor;
    const matchesYear =
      selectedYear === "All" ||
      new Date(post.publishedAt).getFullYear().toString() === selectedYear;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesAuthor && matchesYear && matchesSearch;
  });

  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-wrap justify-between items-center mb-8 py-2">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 w-full md:w-1/3 mb-4 md:mb-0"
        />

        <div className="flex space-x-4 overflow-auto lg:overflow-visible">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none lg:focus:ring-2 lg:focus:ring-gray-400"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Author Filter */}
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none lg:focus:ring-2 lg:focus:ring-gray-400"
          >
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none lg:focus:ring-2 lg:focus:ring-gray-400"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Blog Posts */}
      {loading ? (
        <p className="text-gray-600 text-center mt-8">Loading posts...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <Link
              href={`/blog/${post.slug.current}`}
              className=""
              key={post.slug.current}
            >
              <div
                className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <Image
                  src={post.mainImage?.asset?.url || "/assets/placeholder-blog.svg"}
                  alt={post.mainImage?.alt || post.title || "No title available"}
                  height={720}
                  width={1080}
                  className="w-full object-cover"
                />
                <div className="px-4 pt-2 pb-4">
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-700 mb-4">
                    {post.metaDescription || "No excerpt provided"}
                  </p>
                  <div className="flex items-center space-x-3 mb-2">
                    <Image
                      src={post.author?.image?.asset?.url || "/images/reviewer-7.png"}
                      alt={post.author?.name || "Author"}
                      width={40}
                      height={40}
                      className="rounded-full border border-gray-300"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{post.author?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString()} –{" "}
                        <b>{calculateReadingTime(extractTextFromPortableText(Array.isArray(post.body) ? post.body : []))}</b>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Posts Found */}
      {!loading && filteredPosts.length === 0 && (
        <p className="text-gray-600 text-center mt-8">No posts found.</p>
      )}
    </>
  );
}