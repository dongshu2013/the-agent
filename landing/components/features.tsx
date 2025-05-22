import { MousePointerClick, Target, Globe2, Sparkles, Settings2 } from 'lucide-react';
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
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// AI Solutions Showcase 数据
const showcaseItems = [
  {
    img: '/images/grid-1.png',
    title: 'AutoPilot AI Assistant',
    desc: 'A lightweight AI layer for any site — smart tools, \n one click, zero hassle.',
  },
  {
    img: '/images/grid-2.png',
    title: 'Bring You Own Model',
    desc: 'Connect custom AI models or third-party services to enhance \n automation, adapting to unique workflows.',
  },
  {
    img: '/images/grid-3.png',
    title: 'Maximize Your Value',
    desc: 'AI that handles the busywork so you can focus on what matters. \n Say goodbye to overload and unlock faster, smarter execution.',
    colSpan: true,
  },
];

function ShowcaseGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-3 md:grid-rows-2 gap-8">
      {showcaseItems.map(item => (
        <div
          key={item.title}
          className={`relative flex flex-col items-center text-center bg-[#f4f4f4] rounded-2xl overflow-hidden ${
            item.colSpan ? 'md:col-span-2' : ''
          }`}
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
          <div className="w-full flex justify-center my-4 z-10">
            <Image
              src={item.img}
              alt={item.title}
              width={400}
              height={200}
              className="rounded-lg object-contain"
            />
          </div>
          <h3 className="text-[#0C0A09] text-xl font-medium mb-2 z-10">{item.title}</h3>
          <p className="text-[#78716C] mb-4 z-10 whitespace-pre-line">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function Features() {
  const features = [
    {
      icon: <MousePointerClick className="w-6 h-6 text-gray-600" />,
      title: 'AI-Powered One-Click Actions',
      description:
        'Automate clicks, forms, and navigation without coding, boosting efficiency by 90%.',
    },
    {
      icon: <Target className="w-6 h-6 text-gray-600" />,
      title: 'Accurate Element Targeting',
      description:
        'AI dynamically parses web pages to identify buttons, forms, and more, minimizing errors.',
    },
    {
      icon: <Globe2 className="w-6 h-6 text-gray-600" />,
      title: 'Chrome Browsers & Languages Supported',
      description: 'Works on Chrome browsers with multilingual support, fitting global user needs',
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Smart AI Tips for Effortless Results</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Automate your web tasks in
            <br />
            one click: Order → Done.
          </h2>
          <p className="text-md text-gray-600">
            AI-generated management provides actionable insights and guidance,
            <br />
            enabling users to achieve efficient results effortlessly.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* AI Solutions Showcase */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">AI-Powered Solutions</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Revolutionize Your Process
              <br />
              with AI Features
            </h2>
            <p className="text-md text-gray-600">
              Explore AI features that streamline workflows, boost productivity, and simplify
              <br />
              decision-making for better results.
            </p>
          </div>
          <ShowcaseGrid />
        </div>
      </div>
    </section>
  );
}
