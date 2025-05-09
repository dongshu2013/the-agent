import { MessageCircleMore, SquarePen, Settings } from "lucide-react";

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
      <div style={{ display: "flex", alignItems: "center", height: "44px" }}>
        <button
          onClick={setShowConversationList}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageCircleMore size={20} />
          </div>
        </button>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#111827",
            display: "flex",
            alignItems: "center",
          }}
        >
          Mysta Agent
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <button
          onClick={createNewConversation}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
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
          <SquarePen size={20} />
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
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
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default Header;
