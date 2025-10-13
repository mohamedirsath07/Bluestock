// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Login page initialized');

    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle Password Visibility
    togglePasswordBtn?.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        // Toggle eye icon (you can add different icons for show/hide)
        togglePasswordBtn.classList.toggle('showing');
    });

    // Handle Form Submission
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Basic validation
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        console.log('Login attempt:', { email });

        // Simulate login (replace with actual API call)
        try {
            // Show loading state
            const loginBtn = loginForm.querySelector('.login-btn');
            const originalText = loginBtn.textContent;
            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Store login state
            localStorage.setItem('userEmail', email);
            localStorage.setItem('loginAttempted', 'true');

            // Redirect to signup/registration page instead of main page
            window.location.href = './signup.html';

        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
            
            // Reset button
            const loginBtn = loginForm.querySelector('.login-btn');
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        }
    });

    // Handle OTP Login Link
    const otpLink = document.querySelector('.otp-link');
    otpLink?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('OTP login feature coming soon!');
    });

    // Handle Forgot Password Link
    const forgotLink = document.querySelector('.forgot-link');
    forgotLink?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Password reset feature coming soon!');
    });

    // Handle Sign Up Link
    const signupLink = document.querySelector('.signup-link-text');
    signupLink?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = './signup.html';
    });
});
