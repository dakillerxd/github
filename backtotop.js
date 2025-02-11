// Show/hide the button based on scroll position
window.onscroll = function() {
    const button = document.getElementById("back-to-top");
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
};

// Scroll to top when button is clicked
document.getElementById("back-to-top").onclick = function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"  // This makes it scroll smoothly
    });
};
