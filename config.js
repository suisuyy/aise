// Extension configuration
const config = {
  search: {
    name: 'AISE Search',
    keyword: '@aise',
    baseUrl: 'https://aise.pages.dev',
    searchPath: '?q={searchTerms}',
    suggestPath: '/suggest?q={searchTerms}',
    iconPath: '/favicon.ico'
  },
  hosts: [
    {
      urlFilter: '*aise.pages.dev',
      priority: 1
    },
    {
      urlFilter: '*suisuy.eu.org',
      priority: 1
    },
    {
      urlFilter: '*mplx.run',
      priority: 1
    },
    {
      urlFilter: '*google.com',
      priority: 1
    },
    {
      urlFilter: '*perplexity.ai',
      priority: 1
    },
    {
      urlFilter: '*bing.com',
      priority: 1
    },
    {
      urlFilter: '*mistral.ai',
      priority: 1
    },
    {
      urlFilter: '*chatgpt.com',
      priority: 1
    },
    {
      urlFilter: '*', // catch-all rule
      priority: 2
    }
  ],
  headers: {
    remove: [
      { header: 'content-security-policy', operation: 'remove' },
      { header: 'content-security-policy-report-only', operation: 'remove' },
      { header: 'x-frame-options', operation: 'remove' },
      { header: 'frame-options', operation: 'remove' }
    ]
  }
};
