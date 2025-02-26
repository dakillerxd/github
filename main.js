/*==============================================
                CONFIGURATION
================================================*/
const baseUrl = '/portfolio';
const defaultPath = `${baseUrl}/content/about/content.md`;
const siteTitle = 'Daniel Noam - Portfolio';
const defaultShowUrls = false;
const defaultShowTopBar = true;
const defaultShowThemeToggle = true;


const structure = {
    "GAMES": {
        path: "content/games",
        pages: [
            { title: "UMD", folder: "umd", visible: false },
            { title: "2D Platformer", folder: "2d-platformer", visible: true },
            { title: "School These Sh*ts", folder: "school-these-shits", visible: true },
            { title: "Pixel Knight", folder: "pixel-knight", visible: true },
        ]
    },
    "Prototypes": {
        path: "content/prototypes",
        pages: [
            { title: "Bubblerena - GGJ 2025", folder: "bubblerena", visible: false },
            { title: "PopACorn", folder: "popacorn", visible: false },
        ]
    },
    "Art": {
        path: "content/art",
        pages: [
            { title: "Shaders", folder: "shaders", visible: false },
            { title: "Blender", folder: "blender", visible: false },
            { title: "Procedural Animations", folder: "proceduralanimations", visible: false },
        ]
    },
};

/*==============================================
            NAVIGATION MANAGEMENT
================================================*/
let activeLink = null;

function setActiveLink(link) {
    if (activeLink) {
        activeLink.classList.remove('active');
    }
    if (link) {
        link.classList.add('active');
        activeLink = link;
    }
}

function findNavigationLink(contentPath) {
    if (!contentPath) return null;

    const nav = document.getElementById('main-nav');
    const links = nav.getElementsByTagName('a');
    const folderMatch = contentPath.match(/\/([^\/]+)\/content\.md$/);

    if (!folderMatch) return null;

    const folderName = folderMatch[1];

    for (const link of links) {
        if (link.onclick && link.onclick.toString().includes(folderName)) {
            return link;
        }
    }
    return null;
}

function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
}

function handleNavigationClick(path, link) {
    loadContent(path);
    setActiveLink(link);
    closeMobileSidebar();
}

function updateSidebarForContent(contentPath) {
    const link = findNavigationLink(contentPath);
    if (link) {
        setActiveLink(link);
    }
    closeMobileSidebar();
}

function buildNavigation() {
    const nav = document.getElementById('main-nav');
    nav.innerHTML = '';

    const aboutLink = document.createElement('a');
    aboutLink.textContent = "About";
    aboutLink.onclick = () => handleNavigationClick(`${baseUrl}/content/about/content.md`, aboutLink);
    nav.appendChild(aboutLink);

    const resumeLink = document.createElement('a');
    resumeLink.textContent = "Resume";
    resumeLink.href = `${baseUrl}/content/about/resume.pdf`;
    resumeLink.target = '_blank';
    resumeLink.onclick = () => {
        console.log('Resume viewed');
        closeMobileSidebar();
    };
    nav.appendChild(resumeLink);

    for (const [section, content] of Object.entries(structure)) {
        // Only create section if it has visible pages
        const visiblePages = content.pages.filter(page => page.visible !== false);

        if (visiblePages.length > 0) {
            const header = document.createElement('h2');
            header.textContent = section;
            nav.appendChild(header);

            // Only create links for visible pages
            visiblePages.forEach(page => {
                const link = document.createElement('a');
                link.textContent = page.title;
                link.onclick = () => handleNavigationClick(
                    `${baseUrl}/${content.path}/${page.folder}/content.md`,
                    link
                );
                nav.appendChild(link);
            });
        }
    }
}

/*==============================================
            CONTENT MANAGEMENT
================================================*/
async function loadContent(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Content not found');
        const content = await response.text();

        const contentElement = document.getElementById('content');
        contentElement.classList.add('loading');
        contentElement.innerHTML = marked.parse(content);
        contentElement.classList.remove('loading');

        window.scrollTo(0, 0);

        // Push new state only if it's different from current
        if (!history.state || history.state.path !== path) {
            history.pushState({path: path}, '', '/portfolio/');
        }

        updateDocumentTitle(path);
        updateSidebarForContent(path);
    } catch (error) {
        console.error('Error loading content:', error);
        document.getElementById('content').innerHTML = `
            <div class="error-message">
                <h1>Content Not Found</h1>
                <p>Sorry, the requested content could not be loaded.</p>
            </div>
        `;
    }
}

function updateDocumentTitle(path) {
    let title = siteTitle;
    const pageName = path.split('/').pop().replace('content.md', '').replace(/-/g, ' ');
    if (pageName) {
        title = `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | ${title}`;
    }
    document.title = title;
}

/*==============================================
            THEME MANAGEMENT
================================================*/
function handleThemeToggle() {
    const isLightMode = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    updateThemeToggles(isLightMode);
}

function updateThemeToggles(isLight) {
    const sidebarToggle = document.getElementById('theme-toggle');
    const mobileToggle = document.querySelector('.mobile-theme-toggle');
    const toggles = [sidebarToggle, mobileToggle];

    toggles.forEach(toggle => {
        if (toggle) {
            const themeIcon = toggle.querySelector('.theme-icon');
            const themeText = toggle.querySelector('.theme-text');

            if (themeIcon) {
                themeIcon.textContent = isLight ? '🌙' : '☀️';
            }
            if (themeText && !themeText.classList.contains('sr-only')) {
                themeText.textContent = `${isLight ? 'Dark' : 'Light'} Mode`;
            }
            toggle.setAttribute('aria-label', `${isLight ? 'Dark' : 'Light'} Mode`);
        }
    });
}

function initThemeToggle() {
    const sidebarToggle = document.getElementById('theme-toggle');
    const mobileToggle = document.querySelector('.mobile-theme-toggle');
    const toggles = [sidebarToggle, mobileToggle];

    // Get the saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    // Set initial theme
    document.documentElement.classList.toggle('light-mode', defaultTheme === 'light');
    updateThemeToggles(defaultTheme === 'light');

    // Add click handlers to both toggles
    toggles.forEach(toggle => {
        if (toggle) {
            toggle.removeEventListener('click', handleThemeToggle); // Remove any existing listeners
            toggle.addEventListener('click', handleThemeToggle);
        }
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const isLight = !e.matches;
            document.documentElement.classList.toggle('light-mode', isLight);
            updateThemeToggles(isLight);
        }
    });
}

/*==============================================
            MOBILE MENU HANDLING
================================================*/
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        document.addEventListener('click', (event) => {
            if (!sidebar.contains(event.target) &&
                !menuToggle.contains(event.target) &&
                sidebar.classList.contains('active')) {
                closeMobileSidebar();
            }
        });
    }
}

/*==============================================
            SCROLL ANIMATIONS
================================================*/
function initScrollAnimations() {
    // Elements to observe for scroll animation
    const animatedElements = [
        '.project-card',
        '.image-gallery figure',
        '.page-content h1',
        '.page-content h2',
        '.page-content p',
        '.page-content img'
    ];

    // Create single reusable IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Add the 'visible' class when element enters viewport
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Once the animation has played, we can stop observing the element
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null, // viewport
        threshold: 0.1, // trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // slightly before element enters viewport
    });

    // Apply animations to elements after content loads
    function setupAnimations() {
        // Query all elements we want to animate
        animatedElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);

            // Add fade-in class and observe each element
            elements.forEach((el, index) => {
                // Skip elements that already have animations
                if (!el.classList.contains('fade-in')) {
                    el.classList.add('fade-in');

                    // Add staggered delay for elements of the same type
                    const delayClass = `fade-in-delay-${index % 3 + 1}`;
                    el.classList.add(delayClass);

                    // Start observing the element
                    observer.observe(el);
                }
            });
        });
    }

    // Apply animations when new content is loaded
    const contentElement = document.getElementById('content');
    if (contentElement) {
        // Use MutationObserver to detect when new content is loaded
        const contentObserver = new MutationObserver(() => {
            // Short delay to ensure DOM is fully updated
            setTimeout(setupAnimations, 100);
        });

        contentObserver.observe(contentElement, { childList: true, subtree: true });

        // Also run once on initial page load
        setupAnimations();
    }
}

/*==============================================
            SCROLL TO TOP FUNCTIONALITY
================================================*/
function initScrollToTop() {
    window.onscroll = function() {
        const button = document.getElementById("back-to-top");
        if (button) {
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                button.style.display = "block";
            } else {
                button.style.display = "none";
            }
        }
    };

    const backToTopButton = document.getElementById("back-to-top");
    if (backToTopButton) {
        backToTopButton.onclick = function() {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        };
    }
}

/*==============================================
            BROWSER HISTORY HANDLING
================================================*/
function initHistoryHandling() {
    window.onpopstate = (event) => {
        if (event.state && event.state.path) {
            loadContent(event.state.path);
            const link = findNavigationLink(event.state.path);
            if (link) setActiveLink(link);
        } else {
            // If no state, go to About page
            loadContent(defaultPath);
            const aboutLink = document.querySelector('nav a');
            if (aboutLink) setActiveLink(aboutLink);
        }
    };
}

/*==============================================
            INITIALIZATION
================================================*/
async function init() {
    // Set up navigation structure
    buildNavigation();

    // Initialize UI components
    initMobileMenu();
    initThemeToggle();
    initScrollToTop();
    initHistoryHandling();

    // Apply visibility settings
    if (!defaultShowUrls) {
        document.documentElement.classList.add('hide-urls');
    }

    if (defaultShowTopBar) {
        document.documentElement.classList.add('show-top-bar');
    }

    if (defaultShowThemeToggle) {
        document.documentElement.classList.add('show-theme-toggle');
    } else {
        document.documentElement.classList.add('hide-theme-toggle');
    }

    // Handle content loading based on URL
    const currentPath = window.location.pathname;

    try {
        // Check if we have a state (from back/forward navigation)
        if (history.state && history.state.path) {
            await loadContent(history.state.path);
            const link = findNavigationLink(history.state.path);
            if (link) setActiveLink(link);
        }
        // If we're at the root or direct file access, load About
        else if (currentPath === '/portfolio/' || currentPath === '/portfolio/index.html') {
            await loadContent(defaultPath);
            history.replaceState({path: defaultPath}, '', '/portfolio/');
            const aboutLink = document.querySelector('nav a');
            if (aboutLink) setActiveLink(aboutLink);
        } else {
            // Handle direct file access by redirecting to portfolio root
            window.location.href = '/portfolio/';
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        document.getElementById('content').innerHTML = `
            <div class="error-message">
                <h1>Error Loading Content</h1>
                <p>Sorry, there was an error loading the initial content.</p>
            </div>
        `;
    }
}

// Main window.onload function - entry point for the application
window.onload = async function() {
    // Initialize core functionality
    await init();

    // Initialize scroll animations after content is loaded
    initScrollAnimations();
};