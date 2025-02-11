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
    "PROTOTYPES/GAMEJAMS": {
        path: "content/prototypes",
        pages: [
            { title: "Bubblerena", folder: "bubblerena" },
            { title: "Fruit Ninja Clone", folder: "fruit-ninja-clone" }
        ]
    },
    "ART": {
        path: "content/art",
        pages: [
            { title: "Shaders", folder: "shaders" },
            { title: "Blender", folder: "blender" }
        ]
    }
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
        
        const relativePath = path.replace(baseUrl, '');
        history.pushState({path: relativePath}, '', relativePath);
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

// Handle browser back/forward
window.onpopstate = (event) => {
    if (event.state && event.state.path) {
        loadContent(`${baseUrl}${event.state.path}`);
    }
};

// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!sidebar.contains(event.target) && 
                !menuToggle.contains(event.target) && 
                sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    buildNavigation();
    initMobileMenu();
    
    // Set initial state
    const initialPath = `${baseUrl}/content/about/content.md`;
    loadContent(initialPath);
    history.replaceState({path: '/content/about/content.md'}, '', '/content/about/content.md');
    
    // Set about link as initially active
    const aboutLink = document.querySelector('nav a');
    if (aboutLink) setActiveLink(aboutLink);
});
