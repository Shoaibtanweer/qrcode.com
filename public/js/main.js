// --- Main Frontend Script ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed (main.js)");

    // --- Get Common Elements ---
    const body = document.body;
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeStyles = document.getElementById('dark-mode-styles');
    const currentYearSpan = document.getElementById('current-year');
    const langButton = document.getElementById('language-btn');
    const loginBtn = document.getElementById('login-btn'); // Header Login/Logout button
    const dropdowns = document.querySelectorAll('.dropdown');

    // --- Dark Mode: Apply saved theme on load ---
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
         body.classList.add('dark-mode');
         if (darkModeStyles) darkModeStyles.disabled = false;
         if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        // console.log("Applied dark theme from localStorage");
    } else {
         if (darkModeStyles) darkModeStyles.disabled = true; // Ensure it's disabled for light
         if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        // console.log("Applied light theme (default or from localStorage)");
    }

    // --- Dark Mode: Toggle on button click ---
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
             // console.log("Dark mode button clicked");
             body.classList.toggle('dark-mode');
             let theme = 'light';
             if (body.classList.contains('dark-mode')) {
                 theme = 'dark';
                 if (darkModeStyles) darkModeStyles.disabled = false;
                  darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                 // console.log("Switched to dark theme");
             } else {
                  if (darkModeStyles) darkModeStyles.disabled = true;
                   darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                 // console.log("Switched to light theme");
             }
             localStorage.setItem('theme', theme);
        });
    } else {
        console.warn("Dark mode toggle button (#dark-mode-toggle) not found.");
    }

    // --- Footer Current Year ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Language Button Placeholder ---
    if (langButton) {
        langButton.addEventListener('click', () => {
            alert('Language change functionality not implemented yet.');
        });
    }

    // --- Dropdown Menu Handling ---
    dropdowns.forEach(dropdown => { /* ... Same dropdown logic ... */
        const button = dropdown.querySelector('.dropbtn');
        const content = dropdown.querySelector('.dropdown-content');
        if (button && content) {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        const otherContent = otherDropdown.querySelector('.dropdown-content');
                        if (otherContent) otherContent.style.display = 'none';
                    }
                });
                content.style.display = (content.style.display === 'block') ? 'none' : 'block';
            });
        }
     });
     window.addEventListener('click', (event) => { // Close dropdown on outside click
        dropdowns.forEach(dropdown => {
            const content = dropdown.querySelector('.dropdown-content');
            if (content && content.style.display === 'block') {
                if (!dropdown.contains(event.target)) { content.style.display = 'none'; }
            }
        });
     });

    // --- Authentication UI Handling ---
    const authToken = localStorage.getItem('authToken'); // Check if token exists

    if (loginBtn) {
        // --- IMPORTANT: Remove existing listeners first to prevent duplicates ---
        loginBtn.removeEventListener('click', handleLoginRedirect);
        loginBtn.removeEventListener('click', handleLogout);
        // --- END: Remove existing listeners ---

        if (authToken) {
            // User is logged in (token exists)
            loginBtn.textContent = 'Logout'; // Change button text
            loginBtn.addEventListener('click', handleLogout); // Add logout listener ONLY
            loginBtn.title = 'Logout'; // Update title attribute
            console.log("User appears logged in.");

            // Optionally, display username if stored
            // const userName = localStorage.getItem('userName');
            // if(userName) { ... display welcome message ... }

        } else {
            // User is not logged in
            loginBtn.textContent = 'Login';
            loginBtn.addEventListener('click', handleLoginRedirect); // Add login redirect listener ONLY
            loginBtn.title = 'Login / Register';
             console.log("User appears logged out.");
        }
    } else {
        console.warn("Header login button (#login-btn) not found.");
    }

}); // --- End DOMContentLoaded ---


// --- Auth Helper Functions ---

// Function to redirect to login page
function handleLoginRedirect() {
    console.log("Redirecting to login page...");
    window.location.href = '/login.html';
}

// Function to handle logout
function handleLogout() {
    console.log("handleLogout function called.");
    // Clear authentication token from localStorage
    localStorage.removeItem('authToken');
    // Optionally remove other user data
    // localStorage.removeItem('userName');

    console.log("User logged out, removing token.");
    alert("You have been logged out."); // Simple feedback

    // Redirect to home page after logout
    window.location.href = '/';
}