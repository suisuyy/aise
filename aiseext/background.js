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
            // { header: 'content-security-policy', operation: 'remove' },
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'frame-options', operation: 'remove' }
          ]
        },
        condition: {
          urlFilter: '|*pages.dev|*suisuy.eu.org|*mplx.run|*google.com|*perplexity.ai|*bing.com|*mistral.ai|*chatgpt.com|*openai.com',
          resourceTypes: ['main_frame', 'sub_frame']
        }
      }
    ]
  });
});
