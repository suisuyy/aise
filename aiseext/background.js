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
    removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'content-security-policy', operation: 'remove' },
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'frame-options', operation: 'remove' },
             
          ]
        },
        condition: {
          urlFilter: '*pages.dev',
          resourceTypes: ['main_frame', 'sub_frame']
        }
      },
      // Repeat the same change for rules 2-8, adding the SameSite header
      {
        id: 2,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'content-security-policy', operation: 'remove' },
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'frame-options', operation: 'remove' },
             
          ]
        },
        condition: {
          urlFilter: '*suisuy.eu.org',
          resourceTypes: ['main_frame', 'sub_frame']
        }
      },
      {
        id: 3,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'content-security-policy', operation: 'remove' },
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'frame-options', operation: 'remove' },
             
          ]
        },
        condition: {
          urlFilter: '*mplx.run',
          resourceTypes: ['main_frame', 'sub_frame']
        }
      },
      {
        id: 4,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'content-security-policy', operation: 'remove' },
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'frame-options', operation: 'remove' },
             
          ]
        },
        condition: {
          urlFilter: '*google.com',
          resourceTypes: ['main_frame', 'sub_frame']
        }
      },
      {
        id: 5,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'content-security-policy', operation: 'remove' },
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'frame-options', operation: 'remove' },
             
          ]
        },
        condition: {
          urlFilter: '*perplexity.ai',
          resourceTypes: ['main_frame', 'sub_frame']
        }
      },
      {
        id: 6,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'content-security-policy', operation: 'remove' },
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'frame-options', operation: 'remove' },
             
          ]
        },
        condition: {
          urlFilter: '*bing.com',
          resourceTypes: ['main_frame', 'sub_frame']
        }
      },
      {
        id: 7,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'content-security-policy', operation: 'remove' },
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'frame-options', operation: 'remove' },
             
          ]
        },
        condition: {
          urlFilter: '*mistral.ai',
          resourceTypes: ['main_frame', 'sub_frame']
        }
      },
      {
        id: 8,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'content-security-policy', operation: 'remove' },
            { header: 'x-frame-options', operation: 'remove' },
            { header: 'frame-options', operation: 'remove' },
             
          ]
        },
        condition: {
          urlFilter: '*chatgpt.com',
          resourceTypes: ['main_frame', 'sub_frame']
        }
      }
    ]
  });
});
