// --- Authentication Frontend Logic ---

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loadingIndicator = document.getElementById('auth-loading');
    const errorMessageDiv = document.getElementById('auth-error-msg');

    // --- Helper Function to Display Errors ---
    const showError = (message) => {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message;
            errorMessageDiv.style.display = 'block';
        }
        if (loadingIndicator) loadingIndicator.style.display = 'none'; // Hide loading on error
    };

    // --- Helper Function to Hide Errors/Loading ---
    const hideFeedback = () => {
        if (errorMessageDiv) errorMessageDiv.style.display = 'none';
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    };

    // --- Login Form Handler ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideFeedback();
            if (loadingIndicator) loadingIndicator.style.display = 'block';

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed.');
                }

                // --- Login Successful ---
                console.log('Login successful:', data);
                if (data.token) {
                    // Store the token (e.g., in localStorage)
                    localStorage.setItem('authToken', data.token);
                    // Optionally store user info if sent back
                    // localStorage.setItem('userName', data.user.name);

                    // Redirect to home page
                    window.location.href = '/'; // Redirect to index.html
                } else {
                    throw new Error('Login successful, but no token received.');
                }

            } catch (error) {
                console.error('Login error:', error);
                showError(`Login Failed: ${error.message}`);
            } finally {
                 if (loadingIndicator) loadingIndicator.style.display = 'none';
                 // Re-enable button if needed
                 const loginBtn = document.getElementById('login-submit-btn');
                 if(loginBtn) loginBtn.disabled = false;
            }
        });
    }

    // --- Register Form Handler ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideFeedback();

            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const passwordConfirm = document.getElementById('register-password-confirm').value;

            // Basic frontend validation
            if (password !== passwordConfirm) {
                showError("Passwords do not match.");
                return;
            }
            if (password.length < 6) {
                 showError("Password must be at least 6 characters long.");
                 return;
            }

            if (loadingIndicator) loadingIndicator.style.display = 'block';

            try {
                 const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }) // Send only necessary fields
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed.');
                }

                // --- Registration Successful ---
                console.log('Registration successful:', data);
                 if (data.token) {
                    // Store token
                    localStorage.setItem('authToken', data.token);
                    // Optionally store user info if sent back
                    // localStorage.setItem('userName', data.user.name);

                    // Redirect to home page after registration
                     window.location.href = '/'; // Redirect to index.html
                } else {
                     throw new Error('Registration successful, but no token received.');
                }

            } catch (error) {
                 console.error('Registration error:', error);
                showError(`Registration Failed: ${error.message}`);
            } finally {
                 if (loadingIndicator) loadingIndicator.style.display = 'none';
                 // Re-enable button if needed
                 const regBtn = document.getElementById('register-submit-btn');
                 if(regBtn) regBtn.disabled = false;
            }
        });
    }

}); // End DOMContentLoaded