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
    }
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
// Track active link
let activeLink = null;

// Set active link in navigation
function setActiveLink(link) {
    if (activeLink) {
        activeLink.classList.remove('active');
    }
    if (link) {
        link.classList.add('active');
        activeLink = link;
    }
}

// Close mobile sidebar
function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
}

// Handle navigation click
function handleNavigationClick(path, link) {
    loadContent(path);
    setActiveLink(link);
    closeMobileSidebar();
}

// Find navigation link by content path
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

// Build navigation structure
function buildNavigation() {
    const nav = document.getElementById('main-nav');

    // Create About link
    const aboutLink = document.createElement('a');
    aboutLink.textContent = "About";
    aboutLink.onclick = () => handleNavigationClick(`${baseUrl}/content/about/content.md`, aboutLink);
    nav.appendChild(aboutLink);

    // Create Resume link
    const resumeLink = document.createElement('a');
    resumeLink.textContent = "Resume";
    resumeLink.href = `${baseUrl}/content/about/resume.pdf`;
    resumeLink.target = '_blank';
    resumeLink.onclick = () => {
        console.log('Resume viewed');
        closeMobileSidebar();
    };
    nav.appendChild(resumeLink);

    // Create section headers and links
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
// Animate content elements
function animateContent() {
    // Set animation order for gallery items
    const galleryItems = document.querySelectorAll('.image-gallery figure');
    galleryItems.forEach((item, index) => {
        item.style.setProperty('--animation-order', index);
    });

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.image-gallery figure, .project-card');
    interactiveElements.forEach(element => {
        element.classList.add('hover-lift');
    });
}

// Load content from markdown files
async function loadContent(path) {
    try {
        // Show loading spinner
        const contentElement = document.getElementById('content');
        contentElement.innerHTML = '<div class="loading-spinner"></div>';
        contentElement.classList.add('loading');

        const response = await fetch(path);
        if (!response.ok) throw new Error('Content not found');
        const content = await response.text();

        // Parse and inject content with fade effect
        contentElement.style.opacity = '0';
        contentElement.innerHTML = marked.parse(content);

        // Remove loading state and trigger animations
        contentElement.classList.remove('loading');
        requestAnimationFrame(() => {
            contentElement.style.opacity = '1';
            animateContent();
        });

        window.scrollTo(0, 0);

        // Update UI states
        updateSidebarForContent(path);

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

// Update sidebar active state based on content
function updateSidebarForContent(contentPath) {
    const link = findNavigationLink(contentPath);
    if (link) {
        setActiveLink(link);
    }
    closeMobileSidebar();
}

// Update document title based on current page
function updateDocumentTitle(path) {
    let title = 'Daniel Noam';
    const pageName = path.split('/').pop().replace('content.md', '').replace(/-/g, ' ');
    if (pageName) {
        title = `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | ${title}`;
    }
    document.title = title;
}

/*==============================================
            MOBILE MENU HANDLING
================================================*/
// Initialize mobile menu functionality
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
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
// Show/hide back to top button
window.onscroll = function() {
    const button = document.getElementById("back-to-top");
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
};

// Handle back to top button click
document.getElementById("back-to-top").onclick = function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};

/*==============================================
            BROWSER HISTORY HANDLING
================================================*/
// Handle browser back/forward navigation
window.onpopstate = (event) => {
    if (event.state && event.state.path) {
        loadContent(event.state.path);
        updateSidebarForContent(event.state.path);
    }
};

/*==============================================
            INITIALIZATION
================================================*/
// Handle initial page load
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    buildNavigation();
    initMobileMenu();

    const initialPath = `${baseUrl}/content/about/content.md`;
    loadContent(initialPath);
    history.replaceState({path: initialPath}, '', '/portfolio/');

    const aboutLink = document.querySelector('nav a');
    if (aboutLink) setActiveLink(aboutLink);

    // Make navigation functions globally available for onclick handlers
    window.loadContent = loadContent;
    window.updateSidebarForContent = updateSidebarForContent;
});