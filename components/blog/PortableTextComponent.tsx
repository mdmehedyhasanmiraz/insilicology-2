// components/PortableTextComponent.tsx
'use client';

import { PortableText, PortableTextReactComponents, type PortableTextBlock } from '@portabletext/react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactElement } from 'react';
import { TableValue, ImageValue, TableRow } from '@/types/blog.type';

const components: Partial<PortableTextReactComponents> & { table?: (props: { value: TableValue }) => ReactElement } = {
  types: {
    image: ({ value }: { value: ImageValue }) => {
      const url = value?.asset?.url || '/images/default-placeholder.png';
      return (
        <div className="my-6">
          <Image
            src={url}
            alt={value.alt || 'Blog image'}
            width={800}
            height={500}
            className="rounded-xl object-cover w-full"
          />
        </div>
      );
    },
    table: ({ value }: { value: TableValue }) => (
      <div className="overflow-auto my-6">
        <table className="w-full table-auto border border-gray-300 text-left text-sm text-gray-700">
          <tbody>
            {value.rows?.map((row: TableRow, rowIndex: number) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.cells?.map((cell: string, cellIndex: number) => (
                  <td
                    key={cellIndex}
                    className="border px-4 py-2"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const target = value?.href?.startsWith('http') ? '_blank' : undefined;
      return (
        <Link
          href={value?.href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-blue-600 underline hover:text-blue-800"
        >
          {children}
        </Link>
      );
    },
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  },
  block: {
    h1: ({ children }) => <h1 className="text-4xl font-bold mt-10 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-semibold mt-6 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="text-xl font-semibold mt-4 mb-2">{children}</h4>,
    h5: ({ children }) => <h5 className="text-lg font-semibold mt-3 mb-1">{children}</h5>,
    h6: ({ children }) => <h6 className="text-base font-semibold mt-2 mb-0">{children}</h6>,
    normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
        {children}
      </blockquote>
    ),
    code: ({ children }) => <code className="font-mono bg-gray-100 p-2 rounded-md">{children}</code>,
    codeBlock: ({ children }) => <pre className="font-mono bg-gray-100 p-4 rounded-md">{children}</pre>,
    divider: () => <hr className="my-8 border-t-2 border-gray-300" />,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside mb-4">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-1 ml-4">{children}</li>,
  },
};

export default function PortableTextComponent({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
