

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("front/index.html")
  });
});


// Set up rules when extension is installed
chrome.runtime.onInstalled.addListener(() => {
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
        { header: 'frame-options', operation: 'remove' }
        ]
      },
      condition: {
        urlFilter: '*',
        resourceTypes: [ 'sub_frame']
      }
      }
    ]
    });
});
