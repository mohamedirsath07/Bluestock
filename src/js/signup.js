// Signup Form Handler
document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 Signup page initialized');

    const signupForm = document.getElementById('signupForm');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    // Toggle Password Visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            
            btn.classList.toggle('showing');
        });
    });

    // Mobile number validation
    const mobileInput = document.getElementById('mobile');
    mobileInput?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Password matching validation
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    confirmPasswordInput?.addEventListener('input', () => {
        if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity('Passwords do not match');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    });

    passwordInput?.addEventListener('input', () => {
        if (confirmPasswordInput.value) {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        }
    });

    // Handle Form Submission
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const orgEmail = document.getElementById('orgEmail').value.trim();
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsAccepted = document.getElementById('terms').checked;

        // Validation
        if (!fullName || !mobile || !orgEmail || !gender || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (mobile.length !== 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(orgEmail)) {
            alert('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (!termsAccepted) {
            alert('Please accept the terms and conditions');
            return;
        }

        console.log('Registration data:', {
            fullName,
            mobile: '+91' + mobile,
            orgEmail,
            gender,
            password: '****'
        });

        // Show loading state
        const registerBtn = signupForm.querySelector('.register-btn');
        const originalText = registerBtn.textContent;
        registerBtn.textContent = 'Registering...';
        registerBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Store registration data
            const userData = {
                fullName,
                mobile: '+91' + mobile,
                orgEmail,
                gender,
                registeredAt: new Date().toISOString()
            };

            localStorage.setItem('registeredUser', JSON.stringify(userData));
            localStorage.setItem('userEmail', orgEmail);
            localStorage.setItem('isLoggedIn', 'true');

            // Show success message
            alert('Registration successful! Redirecting to dashboard...');

            // Redirect to main dashboard
            window.location.href = './index.html';

        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
            
            // Reset button
            registerBtn.textContent = originalText;
            registerBtn.disabled = false;
        }
    });

    // Prevent form submission on Enter in input fields (except submit button)
    const inputs = signupForm?.querySelectorAll('input:not([type="submit"])');
    inputs?.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const form = e.target.form;
                const index = Array.from(form.elements).indexOf(e.target);
                const nextElement = form.elements[index + 1];
                if (nextElement && nextElement.tagName === 'INPUT') {
                    nextElement.focus();
                }
            }
        });
    });
});
