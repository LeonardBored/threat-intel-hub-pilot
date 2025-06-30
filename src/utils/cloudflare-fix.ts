
// Utility to handle Cloudflare analytics CORS and integrity issues
export const suppressCloudflareErrors = () => {
  // Monitor for dynamically added scripts and remove integrity attributes from Cloudflare
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && (node as Element).tagName === 'SCRIPT') {
          const script = node as HTMLScriptElement;
          if (script.src && script.src.includes('cloudflareinsights.com')) {
            script.removeAttribute('integrity');
            script.removeAttribute('crossorigin');
            console.log('Removed integrity from Cloudflare script to prevent mismatch errors');
          }
        }
      });
    });
  });
  
  observer.observe(document.head, { childList: true, subtree: true });
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Also check existing scripts on page load
  const checkExistingScripts = () => {
    const scripts = document.querySelectorAll('script[src*="cloudflareinsights.com"]');
    scripts.forEach(script => {
      script.removeAttribute('integrity');
      script.removeAttribute('crossorigin');
      console.log('Removed integrity from existing Cloudflare script');
    });
  };

  // Run immediately and on DOM ready
  checkExistingScripts();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkExistingScripts);
  }

  return () => {
    observer.disconnect();
  };
};

// Enhanced error suppression for console
export const suppressExternalErrors = () => {
  const originalConsoleError = console.error;
  
  console.error = (...args) => {
    const errorString = args.join(' ');
    
    // Suppress Cloudflare and integrity related console errors
    if (errorString.includes('cloudflareinsights') ||
        errorString.includes('beacon.min.js') ||
        errorString.includes('integrity') ||
        errorString.includes('Failed to find a valid digest') ||
        errorString.includes('sha384') ||
        errorString.includes('sha512') ||
        errorString.includes('CORS') ||
        errorString.includes('Cross-Origin')) {
      // Silently ignore these errors
      return;
    }
    
    // For all other errors, use the original console.error
    originalConsoleError.apply(console, args);
  };

  return () => {
    console.error = originalConsoleError;
  };
};
