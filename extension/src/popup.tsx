import React from "react";
import { Storage } from "@plasmohq/storage";

const storage = new Storage();

const Popup = () => {
  const [hasApiKey, setHasApiKey] = React.useState(false);

  React.useEffect(() => {
    const checkApiKey = async () => {
      const apiKey = await storage.get("apiKey");
      setHasApiKey(!!apiKey);
    };
    checkApiKey();
  }, []);

  const openSidePanel = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id) {
        await chrome.sidePanel.setOptions({
          enabled: true,
          path: "sidepanel.html",
        });
        // @ts-ignore - sidePanel.open is available in Chrome 114+
        await chrome.sidePanel.open({ windowId: tab.windowId });
        window.close(); // Close the popup after opening the side panel
      }
    } catch (error) {
      console.error("Error opening side panel:", error);
    }
  };

  return (
    <div
      style={{
        width: "300px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <h2 style={{ margin: "0", fontSize: "18px" }}>MIZU Agent</h2>

      {!hasApiKey ? (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#fef2f2",
            borderRadius: "6px",
            color: "#991b1b",
          }}
        >
          Please set your API key in the settings to use the extension.
        </div>
      ) : (
        <button
          onClick={openSidePanel}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#1d4ed8")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#2563eb")
          }
        >
          Open Side Panel
        </button>
      )}
    </div>
  );
};

export default Popup;
