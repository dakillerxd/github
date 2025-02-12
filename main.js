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

        const basePathname = '/portfolio/';
        if (window.location.pathname !== basePathname) {
            history.pushState({path: path}, '', basePathname);
        }

        updateDocumentTitle(path);
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
        menuToggle.addEventListener('click', () => {
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
    const currentPath = window.location.pathname;
    if (currentPath === '/portfolio/' || currentPath === '/portfolio/index.html') {
        loadContent(`${baseUrl}/content/about/content.md`);
    } else {
        loadContent(`${baseUrl}${currentPath}`);
    }

    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            setActiveLink(link);
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    buildNavigation();
    initMobileMenu();
    initThemeToggle();

    const initialPath = `${baseUrl}/content/about/content.md`;
    loadContent(initialPath);
    history.replaceState({path: initialPath}, '', '/portfolio/');

    const aboutLink = document.querySelector('nav a');
    if (aboutLink) setActiveLink(aboutLink);

    window.loadContent = loadContent;
    window.updateSidebarForContent = updateSidebarForContent;
});