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

// Build navigation menu
function buildNavigation() {
    const nav = document.getElementById('main-nav');
    
    // Add About link first, without a header
    const aboutLink = document.createElement('a');
    aboutLink.textContent = "About";
    aboutLink.onclick = () => loadContent('content/about/content.md');
    nav.appendChild(aboutLink);

    // Add resume link
    const resumeLink = document.createElement('a');
    resumeLink.textContent = "Resume";
    resumeLink.href = 'content/about/resume.pdf';
    resumeLink.target = '_blank'; // Opens in new tab
    nav.appendChild(resumeLink);
    
    // Add sections with headers
    for (const [section, content] of Object.entries(structure)) {
        const header = document.createElement('h2');
        header.textContent = section;
        nav.appendChild(header);
        
        content.pages.forEach(page => {
            const link = document.createElement('a');
            link.textContent = page.title;
            link.onclick = () => loadContent(`${content.path}/${page.folder}/content.md`);
            nav.appendChild(link);
        });
    }
}

// Load content from markdown files
async function loadContent(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Content not found');
        const content = await response.text();
        document.getElementById('content').innerHTML = marked.parse(content);
    } catch (error) {
        console.error('Error loading content:', error);
        document.getElementById('content').innerHTML = '<h1>Content Not Found</h1>';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    buildNavigation();
    // Load about page by default
    loadContent('content/about/content.md');
});
