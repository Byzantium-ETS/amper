// Content script for the L402 Wallet extension

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_MACAROON") {
    // Example: Retrieve macaroon token from storage
    chrome.storage.local.get(["macaroon"], (result) => {
      sendResponse({ macaroon: result.macaroon || null });
    });
    return true; // Keep the message channel open for async response
  }

  if (request.type === "STORE_MACAROON") {
    // Example: Store macaroon token in storage
    const { macaroon } = request;
    chrome.storage.local.set({ macaroon }, () => {
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for async response
  }
});

// Inject a script into the current webpage (if needed)
const injectScript = (file, node) => {
  const th = document.getElementsByTagName(node)[0];
  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", chrome.runtime.getURL(file));
  th.appendChild(script);
};

// Example: Inject a script into the webpage
// injectScript("injected-script.js", "body");

console.log("L402 Wallet content script loaded.");
