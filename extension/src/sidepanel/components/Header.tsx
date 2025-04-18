import {
  PlusIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface HeaderProps {
  setShowSettings: (value: boolean) => void;
  createNewConversation: () => void;
  setShowConversationList: () => void;
  showSettings: boolean;
}

const Header = ({
  setShowSettings,
  createNewConversation,
  setShowConversationList,
  showSettings,
}: HeaderProps) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          onClick={setShowConversationList}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            color: "#6b7280",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#374151";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        </button>
        <span
          style={{
            fontSize: "16px",
            fontWeight: 500,
            color: "#111827",
            marginLeft: "8px",
          }}
        >
          MIZU Agent
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <button
          onClick={createNewConversation}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            color: "#6b7280",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#374151";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#6b7280";
          }}
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
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            color: showSettings ? "#111827" : "#6b7280",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            if (!showSettings) {
              e.currentTarget.style.color = "#374151";
            }
          }}
          onMouseOut={(e) => {
            if (!showSettings) {
              e.currentTarget.style.color = "#6b7280";
            }
          }}
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Header;
