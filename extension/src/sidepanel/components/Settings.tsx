interface SettingsProps {
  apiKey: string;
  setApiKey: (value: string) => void;
  setShowSettings: (value: boolean) => void;
  clearConversation: () => void;
  darkMode: boolean;
}

const Settings = ({
  apiKey,
  setApiKey,
  setShowSettings,
  clearConversation,
  darkMode,
}: SettingsProps) => {
  return (
    <div
      className={`flex flex-col h-screen ${darkMode ? "bg-[#1a1b26]" : "bg-white"}`}
    >
      <div
        className={`flex items-center justify-between p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="flex-1"></div>
        <h1
          className={`text-xl font-medium text-center flex-1 ${darkMode ? "text-white" : "text-gray-800"}`}
        >
          MIZU Agent Settings
        </h1>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => setShowSettings(false)}
            className={`p-2 rounded-md ${
              darkMode
                ? "text-gray-300 hover:bg-gray-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Close settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`flex-1 p-4 ${darkMode ? "text-gray-100" : "text-gray-800"}`}
      >
        <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6">
          <section className="w-full">
            <h2 className="text-xl font-medium mb-4">API Key</h2>
            <div className="space-y-2">
              <label
                htmlFor="apiKey"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                OpenAI API Key
              </label>
              <input
                id="apiKey"
                type="text"
                value={apiKey || ""}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={`w-full max-w-md py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "bg-[#24283b] border-gray-600 text-gray-100 focus:ring-blue-500"
                    : "bg-white border-gray-300 text-gray-800 focus:ring-blue-300"
                }`}
              />
              <p
                className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Your API key will be stored locally and not sent to any third
                party.
              </p>
            </div>
          </section>

          <button
            type="submit"
            className="w-full py-2 max-w-md bg-blue-500 text-gray-800 rounded-lg hover:bg-blue-600 transition-colors border-none"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
