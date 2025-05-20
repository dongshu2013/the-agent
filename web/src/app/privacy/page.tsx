'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export default function TermsOfService() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/content/privacy.md')
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(error => console.error('Error loading Privacy Policy:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <article className="prose prose-slate lg:prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: props => <h1 className="text-3xl font-bold mb-6" {...props} />,
                h2: props => <h2 className="text-2xl font-semibold mt-8 mb-4" {...props} />,
                h3: props => <h3 className="text-xl font-semibold mt-6 mb-3" {...props} />,
                p: props => <p className="mb-4 leading-relaxed" {...props} />,
                ul: props => <ul className="list-disc pl-6 mb-4" {...props} />,
                ol: props => <ol className="list-decimal pl-6 mb-4" {...props} />,
                li: props => <li className="mb-2" {...props} />,
                a: props => (
                  <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
