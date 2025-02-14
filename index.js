let currentTab = localStorage.getItem("defaultTab") || "help";
      let lastQuery = ""; // Track the last search query
      let lastSearchWasSelection = false; // Track if last search was from selection

      // Add engine configuration
      const engines = [
        
        { name: "google", base: "https://www.google.com/search?q=" },
        { name: "bing", base: "https://bing.com?q=" },
        { name: "chatgpt", base: "https://chatgpt.com/?q=", extra: "&hints=search&ref=ext" },
        { name: "perplex", base: "https://www.perplexity.ai/search/new?q=" },
        { name: "claude", base: "https://claude.ai/new?q=" },
        { name: "mistral", base: "https://chat.mistral.ai/chat?q=" },
        { name: "bimg", base: "https://www.bing.com/images/search?q=" },
        { name: "gimg", base: "https://www.google.com/search?udm=2&q=" },
        { name: "groq", base: "https://simpleai.devilent2.workers.dev/?q=" },
        { name: "help", base: "./help.html?" },

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
          // Get the prompt from URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const prompt = urlParams.get("cmd");

          // Combine prompt and query if prompt exists
          const fullQuery = prompt ? `${prompt}: \n\n${query}` : query;

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
        searchContainer.style.top = topbarHeight+10 + 'px';
        
        const searchContainerBottom = searchContainer.offsetTop + searchContainer.offsetHeight;
        resultsContainer.style.top = searchContainerBottom + 'px';
        
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
        allTab.setAttribute("data-target", "all");
        allTab.textContent = "all";
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
          document.getElementById("search-textarea").classList.add("expanded");
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
        textarea.classList.add("expanded");
        bigClearButton.style.display = "block";
      });
      textarea.addEventListener("blur", function () {
        setTimeout(() => {
          textarea.classList.remove("expanded");
          bigClearButton.style.display = "none";
          // Only perform search if query has changed and last search wasn't from selection
          const query = textarea.value;
          if (!lastSearchWasSelection && query.trim() !== lastQuery.trim() && query.trim() !== "") {
            performSearch(query);
          }
          lastSearchWasSelection = false; // Reset the flag
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
      bigClearButton.addEventListener("click", function () {
        textarea.value = "";
        lastQuery = "";
        bigClearButton.style.display = "none";
        // Optionally update URL parameter and focus textarea
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("query");
        history.replaceState({}, "", newUrl.toString());
        textarea.focus();
      });

      document.body.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "Enter") {
          textarea.focus();
        }
      });

      const clearButton = document.getElementById("clear-button");

      textarea.addEventListener("input", function () {
        // Show/hide clear button based on text content
        clearButton.style.display = this.value ? "block" : "none";

        if (this.value !== "") {
          textarea.classList.add("expanded");
          // Update URL with current query
          const newUrl = new URL(window.location.href);
          const urlParams = new URLSearchParams(window.location.search);
          const prompt = urlParams.get("prompt");

          newUrl.searchParams.set(
            "q",
            prompt ? `${prompt}\n\n${this.value}` : this.value
          );
          
          history.replaceState({}, "", newUrl.toString());
        } else {
          // If textarea is empty, remove query parameter
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("query");
          history.replaceState({}, "", newUrl.toString());
        }
      });

      // Clear button functionality
      clearButton.addEventListener("click", function () {
        textarea.value = "";
        lastQuery = ""; // Reset last query
        clearButton.style.display = "none";
        textarea.focus();

        // Clear URL parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("query");
        history.replaceState({}, "", newUrl.toString());

        // Clear iframes
        engines.forEach(engine => {
          const frame = document.getElementById(engine.name + "-frame");
          if (frame) frame.src = "about:blank";
          const urlDisplay = document.getElementById(engine.name + "-url");
          if (urlDisplay) urlDisplay.textContent = "";
        });
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
        textarea.classList.add("expanded");


        
      });

      //document.addEventListener("touchend", handleTextSelection);


