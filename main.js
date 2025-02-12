// Get the base URL for GitHub Pages
const baseUrl = '/portfolio';

// Project structure
const structure = {
    "GAMES": {
        path: "content/games",
        pages: [
            { title: "2D Platformer", folder: "2d-platformer" },
            { title: "School These Shits", folder: "school-these-shits" },
            { title: "Pixel Knight", folder: "pixel-knight" }
        ]
    },
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

// Track active link
let activeLink = null;

function setActiveLink(link) {
    if (activeLink) {
        activeLink.classList.remove('active');
    }
    link.classList.add('active');
    activeLink = link;
}

function buildNavigation() {
    const nav = document.getElementById('main-nav');
    
    // About link
    const aboutLink = document.createElement('a');
    aboutLink.textContent = "About";
    aboutLink.onclick = () => {
        loadContent(`${baseUrl}/content/about/content.md`);
        setActiveLink(aboutLink);
    };
    nav.appendChild(aboutLink);
    
    // Resume link
    const resumeLink = document.createElement('a');
    resumeLink.textContent = "Resume";
    resumeLink.href = `${baseUrl}/content/about/resume.pdf`;
    resumeLink.target = '_blank';
    resumeLink.onclick = () => {
        console.log('Resume viewed');
    };
    nav.appendChild(resumeLink);
    
    // Sections with headers
    for (const [section, content] of Object.entries(structure)) {
        const header = document.createElement('h2');
        header.textContent = section;
        nav.appendChild(header);
        
        content.pages.forEach(page => {
            const link = document.createElement('a');
            link.textContent = page.title;
            link.onclick = () => {
                loadContent(`${baseUrl}/${content.path}/${page.folder}/content.md`);
                setActiveLink(link);
            };
            nav.appendChild(link);
        });
    }
}

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
        
        // Update sidebar active state
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


function updateSidebarForContent(contentPath) {
    const nav = document.getElementById('main-nav');
    const links = nav.getElementsByTagName('a');
    
    // Extract the folder name from the content path
    const folderMatch = contentPath.match(/\/([^\/]+)\/content\.md$/);
    if (!folderMatch) return;
    
    const folderName = folderMatch[1];
    
    // Find and activate the corresponding link
    for (const link of links) {
        // Check if the link's onclick handler contains this folder
        if (link.onclick && link.onclick.toString().includes(folderName)) {
            setActiveLink(link);
            break;
        }
    }
}

// Helper function to update document title
function updateDocumentTitle(path) {
    let title = 'Daniel Noam';
    // Extract page name from path and add to title
    const pageName = path.split('/').pop().replace('content.md', '').replace(/-/g, ' ');
    if (pageName) {
        title = `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | ${title}`;
    }
    document.title = title;
}

// Handle browser back/forward
window.onpopstate = (event) => {
    if (event.state && event.state.path) {
        loadContent(event.state.path);
    }
};

// Mobile menu toggle
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
                sidebar.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

// Back to top button functionality
window.onscroll = function() {
    const button = document.getElementById("back-to-top");
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
};

// Back to top button click handler
document.getElementById("back-to-top").onclick = function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};

// Handle page load and refresh
window.onload = function() {
    const currentPath = window.location.pathname;
    if (currentPath === '/portfolio/' || currentPath === '/portfolio/index.html') {
        // Load default content
        loadContent(`${baseUrl}/content/about/content.md`);
    } else {
        // Load content based on current path
        loadContent(`${baseUrl}${currentPath}`);
    }
    
    // Update active link based on current path
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
    
    // Set initial state
    const initialPath = `${baseUrl}/content/about/content.md`;
    loadContent(initialPath);
    history.replaceState({path: initialPath}, '', '/portfolio/');
    
    // Set about link as initially active
    const aboutLink = document.querySelector('nav a');
    if (aboutLink) setActiveLink(aboutLink);
});
