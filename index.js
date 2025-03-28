let currentTab = localStorage.getItem("defaultTab") || "help";
      let lastQuery = ""; // Track the last search query
      let lastSearchWasSelection = false; // Track if last search was from selection

      // Add engine configuration
      const engines = [
        
        { name: "google", base: "https://www.google.com/search?q=" },
        { name: "bing", base: "https://bing.com?q=" },
        { name: "perplex", base: "https://www.perplexity.ai/?q=" },
        { name: "chatgpt", base: "https://chatgpt.com/?q=", extra: "&hints=search&ref=ext" },
        { name: "claude", base: "https://claude.ai/new?q=" },
        { name: "grok", base: "https://grok.com/?q=" },
        { name: "mistral", base: "https://chat.mistral.ai/chat?q=" },
        { name: "scira", base: "https://scira.app/?q=" },
        { name: "groq", base: "https://simpleai.devilent2.workers.dev/?q=" },
        { name: "bimg", base: "https://www.bing.com/images/search?q=" },
        { name: "gimg", base: "https://www.google.com/search?udm=2&q=" },

        { name: "help", base: "./help.html?" , preload: true},

      ];

      // Function to switch tabs
      function switchTab(target) {
        const tabs = document.querySelectorAll(".tab");
        const framesWrapper = document.querySelector(".frames-wrapper");
        const frameContainers = document.querySelectorAll(".frame-container");

        tabs.forEach((t) => t.classList.remove("active"));
        document
          .querySelector(`[data-target="${target}"]`)
          .classList.add("active");

        if (target === "all") {
          framesWrapper.classList.add("all-tab");
          frameContainers.forEach((container) => {
            container.style.display = "flex";
          });
        } else {
          framesWrapper.classList.remove("all-tab");
          frameContainers.forEach((container) => {
            container.style.display = "none";
          });
          const targetContainer = document.getElementById(
            `${target}-container`
          );
          targetContainer.style.display = "flex";
          if (target !== "groq") {
            targetContainer.scrollIntoView({ behavior: "smooth" });
          }
        }
        
        // Update container positions after tab switch
        updateSearchContainerPosition();
        
        currentTab = target;
        localStorage.setItem("defaultTab", target);
      }

      // Function to create engine iframe containers dynamically
      function createEngineIframes() {
        const framesWrapper = document.querySelector(".frames-wrapper");
        framesWrapper.innerHTML = ""; // Clear existing content

        let i=0;
        // Create engine iframe containers dynamically
        engines.forEach(engine => {
            const container = document.createElement("div");
            container.className = "frame-container";
            container.id = engine.name + "-container";
            // Initially display container if it matches currentTab or if All tab is active
            container.style.display = engine.name === currentTab || currentTab === "all" ? "flex" : "none";

            // Create URL display
            const urlDiv = document.createElement("div");
            urlDiv.className = "url-display";
            urlDiv.id = engine.name + "-url";
            container.appendChild(urlDiv);

            // Create iframe
            const iframe = document.createElement("iframe");
            iframe.className = "results-frame";
            iframe.id = engine.name + "-frame";
            iframe.src = "about:blank";
            if(engine.preload) {
              iframe.src=engine.base;
            }
            iframe.setAttribute("tabindex", "-1");
            iframe.setAttribute("allow", "accelerometer; autoplay; camera; encrypted-media; fullscreen; geolocation; gyroscope; magnetometer; microphone; midi; payment; picture-in-picture; usb");
            container.appendChild(iframe);

            framesWrapper.appendChild(container);
            if(i>2){
            iframe.setAttribute("loading", "lazy");

            }
            i++;
          });

        
      }

      function performSearch(query) {
        // Only proceed if there's a query
        if (query) {
          //make new line \n in query to spaces+\n,encode newline to url 
          // Encode query for URL
          query = encodeURIComponent(query);
          // Get the prompt from URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const prompt = urlParams.get("cmd");

          // Combine prompt and query if prompt exists
            // Get all URL parameters except 'cmd' and 'query'/'q'
            const otherParams = Array.from(urlParams.entries())
            .filter(([key]) => !['cmd', 'q'].includes(key))
            .map(([key, value]) => `&${key}=${value}`)
            .join('');

            // Combine prompt, query and other parameters
            const fullQuery = prompt 
            ? `${prompt}: \n\n${query} ${otherParams}`.trim()
            : `${query}${otherParams}`.trim();

          // If the new query is the same as the last one, do nothing
          if (fullQuery === lastQuery) {
            console.log("Skipping duplicate search: " + fullQuery);
            return;
          }
          lastQuery = fullQuery; // Update the last query
          console.log("query: " + fullQuery);
          // Get all current URL parameters
          const currentParams = new URLSearchParams(window.location.search);
          
          engines.forEach(engine => {
            // Create new search parameters for each engine
            let engineUrl = engine.base  + fullQuery;
            if (engine.extra) {
                engineUrl += engine.extra;
            }
            // Update iframe src and URL display dynamically
            const frame = document.getElementById(engine.name + "-frame");
            if (frame) frame.src = engineUrl;
            const urlDisplay = document.getElementById(engine.name + "-url");
            if (urlDisplay) urlDisplay.textContent = engineUrl;
          });
        }
      }

      function updateSearchContainerPosition() {
        const tabContainer = document.querySelector('.tab-container');
        const searchContainer = document.getElementById('searchContainer');
        const resultsContainer = document.querySelector('.results-container');
        
        const topbarHeight = tabContainer.offsetHeight;
        searchContainer.style.top = topbarHeight + 'px';
        
        const searchContainerBottom = searchContainer.offsetTop + searchContainer.offsetHeight;
        resultsContainer.style.top = searchContainerBottom +30+ 'px';
        
        // Calculate remaining height for results container
        const windowHeight = window.innerHeight;
        resultsContainer.style.height = (windowHeight - searchContainerBottom) + 'px';
      }

      // Updated function to dynamically create tab buttons with event listeners attached
      function createTabButtons() {
        const tabContainer = document.querySelector(".tab-container");
        tabContainer.innerHTML = ""; // Clear existing hard-coded tabs
    
        // Create "all" tab button
        const allTab = document.createElement("button");
        allTab.className = "tab" + (currentTab === "all" ? " active" : "");
        allTab.id='alltab'
        allTab.setAttribute("data-target", "all");
        allTab.textContent = "Home";
        allTab.addEventListener("click", () => {
          switchTab("all");
        });
        tabContainer.appendChild(allTab);
    
        // Create tab buttons for each engine
        engines.forEach(engine => {
            const btn = document.createElement("button");
            btn.className = "tab" + (currentTab === engine.name ? " active" : "");
            btn.setAttribute("data-target", engine.name);
            btn.textContent = engine.name;
            btn.addEventListener("click", () => {
              switchTab(engine.name);
            });
            tabContainer.appendChild(btn);
        });
    
        
      }

      window.onload = function () {
        var urlParams = new URLSearchParams(window.location.search);
        var query = urlParams.get("query") || urlParams.get("q");
        var model = urlParams.get("model");

        // Set initial position of search container
        updateSearchContainerPosition();
        // Update position on window resize
        window.addEventListener('resize', updateSearchContainerPosition);

        // Create engine containers before switching tabs
        createEngineIframes();
        // Dynamically create tab buttons
        createTabButtons();
        
        // Switch to default tab (help if first time, or saved preference)
        switchTab(currentTab);

        if (query) {
          // Update URL to use 'query' parameter consistently
          if (urlParams.has('q') && !urlParams.has('query')) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('q', query);
            history.replaceState({}, "", newUrl.toString());
          }
          document.getElementById("search-textarea").value = query;
          performSearch(query);
          if (model) {
            // If model parameter exists, switch to perplexity tab
            document.querySelector('[data-target="perplexity"]').click();
            // Focus the textarea
            setTimeout(() => {
              document.getElementById("search-textarea").focus();
            }, 100);
          }
        }
        // Always focus textarea when model parameter exists
        else if (model) {
          document.querySelector('[data-target="perplexity"]').click();
          setTimeout(() => {
            document.getElementById("search-textarea").focus();
          }, 100);
        }
        if (!window.location.href.includes("q=")) {
          document.getElementById("search-textarea").focus();
        }
      };

      // Textarea focus and blur functionality
      const textarea = document.getElementById("search-textarea");
      const bigClearButton = document.getElementById("big-clear-button");

      textarea.addEventListener("focus", function () {
        //get textare bottom possition, set button container to this possition
        setTimeout(() => {
          const textareaBottom = textarea.getBoundingClientRect().bottom;
        document.querySelector('.button-container').style.top = textareaBottom + "px";
        document.querySelector('.button-container').style.display = "flex";
        }, 200);

      });
      textarea.addEventListener("blur", function () {
        setTimeout(() => {
          document.querySelector('.button-container').style.display = "none";
          // Only perform search if query has changed and last search wasn't from selection
          
          textarea.style.height='';
        }, 200);
      });
      textarea.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          var query = document.getElementById("search-textarea").value;
          if (query.trim() !== lastQuery.trim()) {
            performSearch(query);
          }
        }
      });

      // New big clear button functionality
      bigClearButton.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        try {
          textarea.select();
          document.execCommand('insertText', false, '');
            
        } catch (error) {
        textarea.value = "";

        }
        // Optionally update URL parameter and focus textarea
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("q");
      });

      document.body.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "Enter") {
          e.preventDefault();
          textarea.focus();
        }
      });


      textarea.addEventListener("input", function () {
        // Remove the show/hide logic for clear button
        const newUrl = new URL(window.location.href);
        const urlParams = new URLSearchParams(window.location.search);
        const prompt = urlParams.get("prompt");

        if (this.value !== "") {
          newUrl.searchParams.set(
            "q",
            prompt ? `${prompt}\n\n${this.value}` : this.value
          );
          history.replaceState({}, "", newUrl.toString());
        } else {
          newUrl.searchParams.delete("query");
          history.replaceState({}, "", newUrl.toString());
        }
      });

 

      // Add paste event listener
      textarea.addEventListener("paste", function (e) {
        // Small delay to ensure the pasted content is in the textarea
        setTimeout(() => {
          if (this.value !== "") {
            performSearch(this.value);
          }
        }, 100);
      });

      // Handle text selection
      function handleTextSelection() {
        const selection = window.getSelection().toString().trim();
        if (selection && selection !== lastQuery) {
          performSearch(selection);
          lastSearchWasSelection = true; // Mark that this search came from selection

          // Update URL with selected text
          const newUrl = new URL(window.location.href);
          const urlParams = new URLSearchParams(window.location.search);
          const prompt = urlParams.get("prompt");

          newUrl.searchParams.set(
            "q",
            prompt ? `${prompt}\n\n${selection}` : selection
          );
          
          history.replaceState({}, "", newUrl.toString());
        }
      }

      // Monitor selection on mouse up and touch end
      textarea.addEventListener("pointerup", (e)=>{
        handleTextSelection();
      });
      //need for touch devices, it dont triggle pointerup when select text
      textarea.addEventListener("pointercancel", (e)=>{
        setTimeout(() => {
            handleTextSelection();
            
        }, 500);
      });

      window.addEventListener("load", function () {
        textarea.focus();


        
      });

      //document.addEventListener("touchend", handleTextSelection);

// Function to get current line text
function getCurrentLine(textarea) {
  const start = textarea.value.lastIndexOf('\n', textarea.selectionStart - 1) + 1;
  const end = textarea.value.indexOf('\n', textarea.selectionStart);
  return textarea.value.substring(start, end === -1 ? textarea.value.length : end);
}

function showToast(message, e) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  toast.style.position = 'fixed';
  // Position toast below pointer
  toast.style.left = (e.clientX +30) + 'px';  // Center horizontally relative to pointer
  toast.style.top = (e.clientY) + 'px';   // Position below pointer
  toast.style.zIndex = '10000';
  toast.style.background = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '8px 16px';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  toast.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 1.7s';
  document.body.appendChild(toast);
  
  // Add required CSS animation if not already present
  if (!document.getElementById('toastAnimations')) {
    const style = document.createElement('style');
    style.id = 'toastAnimations';
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => document.body.removeChild(toast), 2000);
}
// Search button handlers
document.getElementById('search-line-button').addEventListener('pointerdown', function(e) {
  e.preventDefault();
});
document.getElementById('search-line-button').addEventListener('click', function(e) {
  e.preventDefault();
  const currentLine = getCurrentLine(textarea);
  if (currentLine.trim()) {
    performSearch(currentLine);
  }
  // Show toast message with better styling
  

  // Show toast for current line search
  showToast('Search current line', e);

});


document.getElementById('search-button').addEventListener('click', function(e) {
  const query = textarea.value;
  if (query.trim()) {
    performSearch(query);
    showToast('Search', e);
  }
});

document.getElementById('expand-button').addEventListener('pointerdown', function(e) {
  e.preventDefault();
  textarea.style.height = textarea.style.height === '250px' ? '150px' : '250px';
  setTimeout(() => {
    // Update button container position
  const textareaBottom = textarea.getBoundingClientRect().bottom;
  document.querySelector('.button-container').style.top = textareaBottom +10+ "px";
  }, 200);
});

// Update keyboard shortcuts
textarea.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    if (event.shiftKey) {
      event.preventDefault();
      document.getElementById('search-line-button').click();
    } else if (!event.ctrlKey) {
      // Enter without modifiers: search full text
      document.getElementById('search-button').click();
    }
    // Ctrl+Enter just adds a newline (default behavior)
  }
});


