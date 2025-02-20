/*==============================================
                CONFIGURATION
================================================*/
// Base URL for GitHub Pages
const baseUrl = '/portfolio';

// Project structure configuration
const structure = {
    "GAMES": {
        path: "content/games",
        pages: [
            { title: "2D Platformer", folder: "2d-platformer" },
            { title: "School These Shits", folder: "school-these-shits" },
            { title: "Pixel Knight", folder: "pixel-knight" }
        ]
    },
    // Commented sections for future use
    // "PROTOTYPES/GAMEJAMS": {
    //     path: "content/prototypes",
    //     pages: [
    //         { title: "Bubblerena - GGJ 2025", folder: "bubblerena" },
    //         { title: "PopACorn", folder: "fruit-ninja-clone" }
    //     ]
    // },
    // "ART": {
    //     path: "content/art",
    //     pages: [
    //         { title: "Shaders", folder: "shaders" },
    //         { title: "Procedural Animations", folder: "shaders" },
    //         { title: "Blender", folder: "blender" }
    //     ]
    // }
};

function saveCurrentPage(path) {
    sessionStorage.setItem('currentPage', path);
}

function getStoredPage() {
    return sessionStorage.getItem('currentPage');
}

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
    // Clear existing content to prevent duplicates
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
        const header = document.createElement('h2');
        header.textContent = section;
        nav.appendChild(header);

        content.pages.forEach(page => {
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
        saveCurrentPage(path);

        // Updated history management
        const currentPath = path.replace(baseUrl, '');  // Remove baseUrl to get relative path
        const newPath = `/portfolio${currentPath}`;     // Add portfolio prefix

        if (window.location.pathname !== newPath) {
            history.pushState({path: path}, '', newPath);
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
    let title = 'Daniel Noam';
    const pageName = path.split('/').pop().replace('content.md', '').replace(/-/g, ' ');
    if (pageName) {
        title = `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | ${title}`;
    }
    document.title = title;
}

/*==============================================
            THEME MANAGEMENT
================================================*/
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    // Apply initial theme
    document.documentElement.classList.toggle('light-mode', defaultTheme === 'light');
    updateThemeToggle(defaultTheme === 'light');

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const isLightMode = document.documentElement.classList.toggle('light-mode');
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
        updateThemeToggle(isLightMode);
    });

    // Update toggle button appearance
    function updateThemeToggle(isLight) {
        themeIcon.textContent = isLight ? '🌙' : '☀️';
        themeText.textContent = isLight ? 'Dark Mode' : 'Light Mode';
        themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const isLight = !e.matches;
            document.documentElement.classList.toggle('light-mode', isLight);
            updateThemeToggle(isLight);
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
            e.stopPropagation(); // Prevent event bubbling
            sidebar.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking outside
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
            SCROLL TO TOP FUNCTIONALITY
================================================*/
window.onscroll = function() {
    const button = document.getElementById("back-to-top");
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
};

document.getElementById("back-to-top").onclick = function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};

/*==============================================
            BROWSER HISTORY HANDLING
================================================*/
window.onpopstate = (event) => {
    if (event.state && event.state.path) {
        loadContent(event.state.path);
        updateSidebarForContent(event.state.path);
    }
};

/*==============================================
            INITIALIZATION
================================================*/
window.onload = function() {
    buildNavigation();
    initMobileMenu();
    initThemeToggle();

    // Get the stored page or use default
    const storedPath = getStoredPage();
    const defaultPath = `${baseUrl}/content/about/content.md`;
    const initialPath = storedPath || defaultPath;

    loadContent(initialPath);
    history.replaceState({path: initialPath}, '', '/portfolio/');

    // Update sidebar based on stored path
    if (storedPath) {
        const link = findNavigationLink(storedPath);
        if (link) setActiveLink(link);
    } else {
        const aboutLink = document.querySelector('nav a');
        if (aboutLink) setActiveLink(aboutLink);
    }

    window.loadContent = loadContent;
    window.updateSidebarForContent = updateSidebarForContent;
};

