import { MousePointerClick, Globe, Sparkles, BrainCog, BookLock } from 'lucide-react';
import Image from 'next/image';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="w-12 h-12 mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-500 whitespace-pre-line">{description}</p>
    </div>
  );
};

// AI Solutions Showcase 数据
const showcaseItems = [
  {
    img: '/images/grid-3.png',
    title: 'AutoPilot AI Assistant',
    desc: 'A lightweight AI layer for any site — smart tools, \n one click, zero hassle.',
  },
  {
    img: '/images/grid-2.png',
    title: 'Choose Your Favorite Model',
    desc: 'Connect custom AI models or third-party services to enhance \n automation, adapting to unique workflows.',
  },
];

function ShowcaseGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-1 gap-8">
      {showcaseItems.map(item => (
        <div
          key={item.title}
          className="relative flex flex-col items-center text-center bg-[#f4f4f4] rounded-2xl overflow-hidden py-10 px-6"
        >
          {/* 网格线背景 */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <svg
              width="100%"
              height="100%"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e6e6e6" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div
            className="w-full flex justify-center items-center my-4 z-10"
            style={{ height: 200, marginBottom: 32 }}
          >
            <Image
              src={item.img}
              alt={item.title}
              width={400}
              height={200}
              className="rounded-lg object-contain"
            />
          </div>
          <h3 className="text-[#0C0A09] text-xl font-medium mb-2 z-10">{item.title}</h3>
          <p className="text-[#78716C] mb-0 z-10 whitespace-pre-line">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function Features() {
  const features = [
    {
      icon: <MousePointerClick className="w-6 h-6 text-gray-600" />,
      title: 'Effortless Web Automation',
      description:
        'On-click navigation through websites — automate flows without writing a single line.',
    },
    {
      icon: <BookLock className="w-6 h-6 text-gray-600" />,
      title: 'Private AI, Fully Yours',
      description:
        'Deploy your own AI agent locally or in the cloud — no third-party lock-in, full control.',
    },
    {
      icon: <Globe className="w-6 h-6 text-gray-600" />,
      title: 'Browser-Native Intelligence',
      description:
        'Your AI lives inside the web — treating any page as its native interface for action.',
    },
  ];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          {/* <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Deliver More Value, Effortlessly</span>
          </div> */}
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Ask Anything.
            <br />
            Automate Everything.
          </h2>
          <p className="text-md text-gray-600">
            From insight to execution, AI navigates the web
            <br />
            for you with precision and speed.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* AI Solutions Showcase */}
        <div className="mt-16">
          <div className="text-center mb-12">
            {/* <div className="inline-flex items-center gap-2 mb-4">
              <BrainCog className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Let AI Drive the Value</span>
            </div> */}
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              Work Smarter. Grow Faster.
            </h2>
            <p className="text-md text-gray-600">
              Unlock AI features that eliminate tedious tasks, cut labor costs, and supercharge your
              <br />
              workflows — so you can focus on what really moves the needle.
            </p>
          </div>
          <ShowcaseGrid />
        </div>
      </div>
    </section>
  );
}
