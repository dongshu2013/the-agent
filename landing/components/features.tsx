import { MousePointerClick, Target, Globe2, Sparkles, Settings2, RotateCw } from 'lucide-react';

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

          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Sidebar */}
            <div className="bg-gray-50 rounded-lg p-8 h-full">
              <div className="bg-white rounded-lg shadow-sm h-full">
                <div className="p-6">
                  <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">AI sidebar</h3>
                    <p className="text-sm text-gray-600">
                      One-click AI automation, analysis, and smart tools
                      <br />
                      on any site — no code or switching needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seamless API Key */}
            <div className="bg-gray-50 rounded-lg p-8 h-full">
              <div className="bg-white rounded-lg shadow-sm h-full p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Your API Key</h3>
                    <p className="text-sm text-gray-600">
                      Use this API key to authenticate requests to the Mysta API.
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Close</span>×
                  </button>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <code className="text-sm text-gray-600 flex-1">
                    3e525654-fe12-4a49-9062-52654fc212a4
                  </code>
                  <button className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-md">
                    <RotateCw className="w-4 h-4" />
                    Rotate key
                  </button>
                </div>
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2">Seamless API Key Configuration</h4>
                  <p className="text-sm text-gray-600">
                    Connect custom AI models or third-party services to enhance automation, adapting
                    to unique workflows.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Solve Your Problem */}
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-2 border rounded-lg p-3">
                  <Sparkles className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ask me Anything..."
                    className="flex-1 border-0 focus:outline-none text-gray-600 bg-transparent cursor-default"
                    disabled
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center gap-3">
                    <MousePointerClick className="w-5 h-5 text-blue-600" />
                    <span>AI-Powered Task Automation</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                    <Target className="w-5 h-5 text-gray-600" />
                    <span>Dynamic Element Detection</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                    <Globe2 className="w-5 h-5 text-gray-600" />
                    <span>API Ecosystem & Customization</span>
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Solve Your Problem</h3>
              <p className="text-gray-600">
                Can equip you for any challenge. Say goodbye to stress and
                <br />
                welcome a smoother, more confident experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
