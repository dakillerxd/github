// navigation.js
const structure = {
    "GAMES": {
        path: "content/games",
        pages: [
            { title: "2D Platformer", folder: "2d-platformer" },
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

function buildNavigation() {
    const nav = document.querySelector('nav');
    
    for (const [section, content] of Object.entries(structure)) {
        // Add section header
        const header = document.createElement('h2');
        header.textContent = section;
        nav.appendChild(header);
        
        // Add pages
        content.pages.forEach(page => {
            const link = document.createElement('a');
            link.href = `#${page.folder}`;
            link.textContent = page.title;
            link.onclick = () => loadContent(`${content.path}/${page.folder}`);
            nav.appendChild(link);
        });
    }
}

async function loadContent(path) {
    try {
        const response = await fetch(`${path}/index.md`);
        const content = await response.text();
        document.querySelector('main').innerHTML = marked.parse(content);
    } catch (error) {
        console.error('Error loading content:', error);
    }
}
