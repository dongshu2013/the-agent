const Popup = () => {
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
      <h2 style={{ margin: "0", fontSize: "18px" }}>Mysta Agent</h2>
      <button
        onClick={openSidePanel}
        style={{
          padding: "8px 16px",
          backgroundColor: "black",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
          transition: "opacity 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = "0.7")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Open Side Panel
      </button>
    </div>
  );
};

export default Popup;
