

chrome.action.onClicked.addListener((tab) => {

  chrome.tabs.update(tab.id, {
    url: chrome.runtime.getURL("front/index.html")
  });
});


//monitor tab change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  setTimeout(() => {
    checkIfRuleAppliesToCurrentTab();
    
  }, 1000);

  if (changeInfo.status === 'complete' && tab.url) {
    // Check if the rule applies to the current tab
  }
}
);

// Set up rules when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('oninstalled aise');
  //get declarativeNetRequest rules and log it
  chrome.declarativeNetRequest.getDynamicRules({}, (rules) => {
    console.log('previous rules:\n',rules);
  });
  // Add AISE as search engine 
  if (chrome.search && chrome.search.addEngine) {
    chrome.search.addEngine({
      name: 'AISE Search',
      keyword: '@aise',
      is_default: true,
      search_url: 'https://aise.pages.dev?q={searchTerms}',
      suggest_url: 'https://aise.pages.dev/suggest?q={searchTerms}'
    });
  }
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'frame-options', operation: 'remove' },
            {
              header: 'content-security-policy',
              operation: 'remove'
            }

          ]
        },
        condition: {
          urlFilter: 'https://*',
        }
      }
    ]
  },()=>{
    chrome.declarativeNetRequest.getDynamicRules({}, (rules) => {
      console.log('current rules:\n',rules);
    });
  });
});






// Function to check if the rule applies to the current tab
function checkIfRuleAppliesToCurrentTab() {
  // Query the active tab in the current window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.log("No active tab found.");
      return;
    }

    const currentTab = tabs[0];
    const tabUrl = currentTab.url || currentTab.pendingUrl; // Fallback to pendingUrl if url is not yet available

    if (!tabUrl) {
      console.log("Tab URL is not available.");
      return;
    }

    // Define the rule's conditions (same as in your updateDynamicRules)
    const ruleCondition = {
      urlFilter: "https://*",
      resourceTypes: ["sub_frame"]
    };

    // Check if the URL matches the urlFilter
    const urlMatches = tabUrl.startsWith("https://"); // Simple check for 'https://*' wildcard

    // Note: resourceTypes like 'sub_frame' apply to requests, not the tab's main URL directly.
    // For a tab's main URL, you might want to adjust this logic based on your intent.
    const isSubFrameContext = false; // Tabs are typically 'main_frame', not 'sub_frame'.
                                     // You'd need additional logic to detect subframe requests.

    // Log the result
    if (urlMatches && ruleCondition.resourceTypes.includes("sub_frame")) {
      console.log(`Rule applies to requests in tab: ${tabUrl} (for sub_frame resource type)`);
    } else {
      console.log(`Rule does NOT apply to the current tab: ${tabUrl}`);
      console.log(`Reason: ${!urlMatches ? "URL doesn't match" : "Resource type mismatch"}`);
    }
  });
}