// Signup Form Handler
document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 Signup page initialized');

    const signupForm = document.getElementById('signupForm');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    // OTP Modal elements
    const otpModal = document.getElementById('otpModal');
    const otpInput = document.getElementById('otpInput');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const closeOtpModalBtn = document.getElementById('closeOtpModal');
    const resendOtpLink = document.getElementById('resendOtp');
    const maskedMobileSpan = document.getElementById('maskedMobile');
    const otpError = document.getElementById('otpError');
    
    let generatedOTP = '';
    let userMobile = '';
    let userRegistrationData = null;

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

        // Store registration data temporarily
        userRegistrationData = userData;
        userMobile = mobile;

        // Generate OTP (6 digit random number)
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('🔐 Generated OTP:', generatedOTP); // For demo purposes

        // Mask mobile number for display
        const maskedNumber = `+91 ${mobile.substring(0, 5)}*****${mobile.substring(8)}`;
        maskedMobileSpan.textContent = maskedNumber;

        // Reset button
        registerBtn.textContent = originalText;
        registerBtn.disabled = false;

        // Show OTP modal
        showOTPModal();

    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
        
        // Reset button
        registerBtn.textContent = originalText;
        registerBtn.disabled = false;
    }
});

// OTP Modal Functions
function showOTPModal() {
    otpModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    otpInput.value = '';
    otpInput.classList.remove('error', 'success');
    otpError.classList.remove('show');
}

function closeOTPModal() {
    otpModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close OTP Modal
closeOtpModalBtn?.addEventListener('click', closeOTPModal);

// Close modal on overlay click
otpModal?.addEventListener('click', (e) => {
    if (e.target === otpModal) {
        closeOTPModal();
    }
});

// OTP Input - Only numbers
otpInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    otpInput.classList.remove('error');
    otpError.classList.remove('show');
});

// Resend OTP
let resendTimeout;
resendOtpLink?.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (resendOtpLink.classList.contains('disabled')) {
        return;
    }
    
    // Generate new OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 Resent OTP:', generatedOTP);
    
    // Show success message
    alert('OTP has been resent to your mobile number');
    
    // Disable resend for 30 seconds
    resendOtpLink.classList.add('disabled');
    resendOtpLink.textContent = 'Resend OTP (30s)';
    
    let countdown = 30;
    resendTimeout = setInterval(() => {
        countdown--;
        resendOtpLink.textContent = `Resend OTP (${countdown}s)`;
        
        if (countdown <= 0) {
            clearInterval(resendTimeout);
            resendOtpLink.classList.remove('disabled');
            resendOtpLink.textContent = 'Resend OTP';
        }
    }, 1000);
});

// Verify OTP
verifyOtpBtn?.addEventListener('click', async () => {
    const enteredOTP = otpInput.value.trim();
    
    if (!enteredOTP) {
        alert('Please enter the OTP');
        return;
    }
    
    if (enteredOTP.length !== 6) {
        alert('OTP must be 6 digits');
        return;
    }
    
    // Show loading state
    verifyOtpBtn.textContent = 'Verifying...';
    verifyOtpBtn.disabled = true;
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify OTP
    if (enteredOTP === generatedOTP) {
        // Success
        otpInput.classList.remove('error');
        otpInput.classList.add('success');
        
        // Store login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('mobileVerified', 'true');
        
        // Show success message
        alert('Mobile number verified successfully! Redirecting to dashboard...');
        
    // Redirect to dashboard settings page (open Settings / Company Info)
    window.location.href = './index.html?section=settings';
        
    } else {
        // Error
        otpInput.classList.add('error');
        otpError.classList.add('show');
        verifyOtpBtn.textContent = 'Verify Mobile';
        verifyOtpBtn.disabled = false;
        
        // Shake animation
        otpInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            otpInput.style.animation = '';
        }, 500);
    }
});    // Prevent form submission on Enter in input fields (except submit button)
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
