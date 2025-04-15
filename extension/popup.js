/**
 * MIZU Agent Popup Script
 * 
 * Handles popup functionality and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Open sidepanel when clicking the "Open MIZU Agent" button
  document.getElementById('openSidepanel')?.addEventListener('click', () => {
    if (chrome.sidePanel) {
      chrome.sidePanel.open().catch(error => {
        console.error('Error opening side panel:', error);
      });
    }
    window.close();
  });

  // Open sidepanel with focus on input when clicking "Ask a question"
  document.getElementById('askQuestion')?.addEventListener('click', () => {
    if (chrome.sidePanel) {
      chrome.sidePanel.open().then(() => {
        // Send a message to focus on the input field
        chrome.runtime.sendMessage({ name: "focus-input" });
      }).catch(error => {
        console.error('Error opening side panel:', error);
      });
    }
    window.close();
  });
}); 