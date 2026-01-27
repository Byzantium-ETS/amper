// background.js
// This script runs in the background of the browser extension and handles events like network requests, storage, and messaging.

console.log("L402 Wallet Extension Background Script Loaded");

// Listener for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);

  if (message.type === "GET_MACAROON") {
    // Example: Handle a request to retrieve a stored macaroon
    chrome.storage.local.get(["macaroon"], (result) => {
      sendResponse({ macaroon: result.macaroon });
    });
    return true; // Indicates that the response will be sent asynchronously
  }

  if (message.type === "STORE_MACAROON") {
    // Example: Handle a request to store a macaroon
    chrome.storage.local.set({ macaroon: message.data }, () => {
      console.log("Macaroon stored successfully");
      sendResponse({ success: true });
    });
    return true; // Indicates that the response will be sent asynchronously
  }
});

// Listener for network requests (optional, for debugging or intercepting requests)
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log("Intercepted request:", details);
    // Modify or log requests here if needed
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
