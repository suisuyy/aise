let currentTab = localStorage.getItem("defaultTab") || "help";
      let lastQuery = ""; // Track the last search query
      let lastSearchWasSelection = false; // Track if last search was from selection

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

      function performSearch(query) {
        // Only proceed if there's a query
        if (query) {
          // Get the prompt from URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const prompt = urlParams.get("prompt");

          // Combine prompt and query if prompt exists
          const fullQuery = prompt ? `${prompt}\n\n${query}` : query;

          // If the new query is the same as the last one, do nothing
          if (fullQuery === lastQuery) {
            console.log("Skipping duplicate search: " + fullQuery);
            return;
          }
          lastQuery = fullQuery; // Update the last query
          console.log("query: " + fullQuery);
          // Get all current URL parameters
          const currentParams = new URLSearchParams(window.location.search);
          
          // Create new URLSearchParams objects for each service
          const googleParams = new URLSearchParams(currentParams);
          const groqParams = new URLSearchParams(currentParams);
          const perplexityParams = new URLSearchParams(currentParams);
          const bingParams = new URLSearchParams(currentParams);
          const mistralParams = new URLSearchParams(currentParams);
          
          // Set the query parameter for each service (they use different parameter names)
          googleParams.set('q', fullQuery);
          groqParams.set('q', fullQuery);
          perplexityParams.set('q', fullQuery);
          bingParams.set('q', fullQuery);
          mistralParams.set('q', fullQuery);

          var googleUrl = "https://www.google.com/search?" + googleParams.toString();
          var groqUrl = "https://simpleai.devilent2.workers.dev/?" + groqParams.toString();
          var perplexityaiUrl = "https://www.perplexity.ai/search/new?" + perplexityParams.toString();
          var bingUrl = "https://bing.com?" + bingParams.toString();
          var chatgptUrl = "https://chatgpt.com/?" + groqParams.toString()+'&hints=search&ref=ext';
          var mistralUrl = "https://chat.mistral.ai/chat?" + mistralParams.toString();

          document.getElementById("google-frame").src = googleUrl;
          document.getElementById("perplexityai-frame").src = perplexityaiUrl;
          document.getElementById("bing-frame").src = bingUrl;
          document.getElementById('groq-frame').src = groqUrl;
          document.getElementById('chatgpt-frame').src = chatgptUrl;
          document.getElementById('mistral-frame').src = mistralUrl;

          document.getElementById("google-url").textContent = googleUrl;
          document.getElementById("groq-url").textContent = groqUrl;
          document.getElementById("perplexityai-url").textContent = perplexityaiUrl;
          document.getElementById("bing-url").textContent = bingUrl;
          document.getElementById("chatgpt-url").textContent = chatgptUrl;
          document.getElementById("mistral-url").textContent = mistralUrl;

          
        }
      }

      function updateSearchContainerPosition() {
        const tabContainer = document.querySelector('.tab-container');
        const searchContainer = document.getElementById('searchContainer');
        const resultsContainer = document.querySelector('.results-container');
        
        const topbarHeight = tabContainer.offsetHeight;
        searchContainer.style.top = topbarHeight + 'px';
        
        const searchContainerBottom = searchContainer.offsetTop + searchContainer.offsetHeight;
        resultsContainer.style.top = searchContainerBottom + 'px';
        
        // Calculate remaining height for results container
        const windowHeight = window.innerHeight;
        resultsContainer.style.height = (windowHeight - searchContainerBottom) + 'px';
      }

      window.onload = function () {
        var urlParams = new URLSearchParams(window.location.search);
        var query = urlParams.get("query") || urlParams.get("q");
        var model = urlParams.get("model");

        // Set initial position of search container
        updateSearchContainerPosition();
        // Update position on window resize
        window.addEventListener('resize', updateSearchContainerPosition);

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

      // Tab functionality
      const tabs = document.querySelectorAll(".tab");
      const framesWrapper = document.querySelector(".frames-wrapper");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          switchTab(tab.getAttribute("data-target"));
        });
      });

      // Textarea focus and blur functionality
      const textarea = document.getElementById("search-textarea");
      textarea.addEventListener("focus", function () {
        textarea.classList.add("expanded");
      });
      textarea.addEventListener("blur", function () {
        setTimeout(() => {
          textarea.classList.remove("expanded");
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
        document.getElementById("google-frame").src = "about:blank";
        document.getElementById("bing-frame").src = "about:blank";
        document.getElementById("chatgpt-frame").src = "about:blank";
        document.getElementById("mistral-frame").src = "about:blank";
        document.getElementById("perplexity-url").textContent = "";
        document.getElementById("google-url").textContent = "";
        document.getElementById("bing-url").textContent = "";
        document.getElementById("chatgpt-url").textContent = "";
        document.getElementById("mistral-url").textContent = "";
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


