// Remove sandbox attributes from iframes
function removeSandbox() {
  const frames = document.getElementsByTagName('iframe');
  for (let frame of frames) {
    frame.removeAttribute('sandbox');
  }
}

// Override CSP meta tags
function removeCSPMeta() {
  const metas = document.getElementsByTagName('meta');
  for (let meta of metas) {
    if (meta.httpEquiv === 'Content-Security-Policy') {
      meta.remove();
    }
  }
}

// Run when DOM loads
document.addEventListener('DOMContentLoaded', function() {
}, { passive: true });
  removeSandbox();
  removeCSPMeta();
});

// Run for dynamically added content
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.addedNodes.length) {
      removeSandbox();
      removeCSPMeta();
    }
  });
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
