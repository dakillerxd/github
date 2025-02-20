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

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    document.documentElement.classList.toggle('light-mode', defaultTheme === 'light');
    updateThemeToggle(defaultTheme === 'light');

    themeToggle.addEventListener('click', () => {
        const isLightMode = document.documentElement.classList.toggle('light-mode');
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
        updateThemeToggle(isLightMode);
    });

    function updateThemeToggle(isLight) {
        themeIcon.textContent = isLight ? '🌙' : '☀️';
        themeText.textContent = isLight ? 'Dark Mode' : 'Light Mode';
        themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
    }

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
        const link = findNavigationLink(event.state.path);
        if (link) setActiveLink(link);
    } else {
        // If no state, go to About page
        const defaultPath = `${baseUrl}/content/about/content.md`;
        loadContent(defaultPath);
        const aboutLink = document.querySelector('nav a');
        if (aboutLink) setActiveLink(aboutLink);
    }
};

/*==============================================
            INITIALIZATION
================================================*/
window.onload = function() {
    buildNavigation();
    initMobileMenu();
    initThemeToggle();

    const currentPath = window.location.pathname;
    const defaultPath = `${baseUrl}/content/about/content.md`;

    // Check if we have a state (from back/forward navigation)
    if (history.state && history.state.path) {
        loadContent(history.state.path);
        const link = findNavigationLink(history.state.path);
        if (link) setActiveLink(link);
    }
    // If we're at the root or direct file access, load About
    else if (currentPath === '/portfolio/' || currentPath === '/portfolio/index.html') {
        loadContent(defaultPath);
        history.replaceState({path: defaultPath}, '', '/portfolio/');
        const aboutLink = document.querySelector('nav a');
        if (aboutLink) setActiveLink(aboutLink);
    } else {
        // Handle direct file access by redirecting to portfolio root
        window.location.href = '/portfolio/';
    }
};