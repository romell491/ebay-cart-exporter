// Service worker for Ebay Cart Exporter
// This handles the background functionality for the extension

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // Forward messages to the popup
    if (request.action === "getSource") {
      // This will forward the message to any open popup
      chrome.runtime.sendMessage(request);
    }
    // Return true to indicate async response
    return true;
  }
);