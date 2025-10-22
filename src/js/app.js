// Application State
const state = {
    currentTab: 'company-info',
    formData: {
        logo: null,
        banner: null,
        companyName: '',
        aboutUs: '',
        organizationType: '',
        industryType: '',
        teamSize: '',
        establishmentYear: '',
        companyWebsite: '',
        companyVision: '',
        mapLocation: '',
        contactPhone: '',
        contactEmail: ''
    }
};

// DOM Elements
const elements = {
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    logoInput: document.getElementById('logoInput'),
    bannerInput: document.getElementById('bannerInput'),
    logoUploadArea: document.getElementById('logoUploadArea'),
    bannerUploadArea: document.getElementById('bannerUploadArea'),
    logoPreview: document.getElementById('logoPreview'),
    bannerPreview: document.getElementById('bannerPreview'),
    companyInfoForm: document.getElementById('companyInfoForm'),
    foundingInfoForm: document.getElementById('foundingInfoForm'),
    successAlert: document.getElementById('successAlert'),
    alertMessage: document.getElementById('alertMessage'),
    progressFill: document.getElementById('setupProgressFill'),
    progressPercentage: document.getElementById('setupProgressText')
};

// Calculate Progress
function calculateProgress() {
    const fields = [
        state.formData.logo,
        state.formData.banner,
        state.formData.companyName,
        state.formData.aboutUs,
        state.formData.organizationType,
        state.formData.industryType,
        state.formData.teamSize,
        state.formData.establishmentYear,
        state.formData.companyWebsite,
        state.formData.companyVision,
        state.formData.mapLocation,
        state.formData.contactPhone,
        state.formData.contactEmail
    ];
    
    const filledFields = fields.filter(field => {
        if (typeof field === 'string') return field.trim() !== '';
        return field !== null && field !== false;
    }).length;
    
    const percentage = Math.round((filledFields / fields.length) * 100);
    
    // Update progress bar in header
    if (elements.progressFill) {
        elements.progressFill.style.width = `${percentage}%`;
    }

    // Update textual percentage if present
    if (elements.progressPercentage) {
        elements.progressPercentage.textContent = `${percentage}% Completed`;
    }
    
    return percentage;
}

// Initialize Application
function init() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = './login.html';
        return;
    }
    
    console.log('🚀 HireNext Company Information System Initialized');
    setupEventListeners();
    loadSavedData();

    // If redirected after signup, open the Settings (Company Info) view
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section === 'settings') {
        // Activate Company Info tab by default
        const targetBtn = document.querySelector('.tab-btn[data-tab="company-info"]');
        if (targetBtn) targetBtn.click();
    }

    calculateProgress();
}

// Show Success Alert
function showAlert(message = 'File uploaded successfully!') {
    elements.alertMessage.textContent = message;
    elements.successAlert.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        elements.successAlert.classList.add('hidden');
    }, 3000);
}

// Close Alert
window.closeAlert = function() {
    elements.successAlert.classList.add('hidden');
};

// Remove Image
window.removeImage = function(type) {
    if (type === 'logo') {
        elements.logoPreview.src = '';
        const container = elements.logoUploadArea.querySelector('.image-preview-container');
        const placeholder = elements.logoUploadArea.querySelector('.upload-placeholder');
        container.style.display = 'none';
        placeholder.style.display = 'flex';
        elements.logoInput.value = '';
        state.formData.logo = null;
    } else if (type === 'banner') {
        elements.bannerPreview.src = '';
        const container = elements.bannerUploadArea.querySelector('.image-preview-container');
        const placeholder = elements.bannerUploadArea.querySelector('.upload-placeholder');
        container.style.display = 'none';
        placeholder.style.display = 'flex';
        elements.bannerInput.value = '';
        state.formData.banner = null;
    }
    
    saveFormData();
    console.log(`🗑️ ${type} image removed`);
};

// Social Media Functions
let socialLinkCounter = 4;

window.addNewSocialLink = function() {
    socialLinkCounter++;
    const container = document.getElementById('socialLinksContainer');
    
    const newLinkHTML = `
        <div class="social-link-row">
            <label class="form-label">Social Link ${socialLinkCounter}</label>
            <div class="social-link-input-group">
                <select class="social-platform-select">
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">Youtube</option>
                    <option value="linkedin">LinkedIn</option>
                </select>
                <input 
                    type="url" 
                    class="social-link-input" 
                    placeholder="Profile link/url..."
                />
                <button type="button" class="remove-social-btn" onclick="removeSocialLink(this)">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm4 10.5L10.5 12 8 9.5 5.5 12 4 10.5 6.5 8 4 5.5 5.5 4 8 6.5 10.5 4 12 5.5 9.5 8 12 10.5z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', newLinkHTML);
    console.log('➕ New social link added');
};

window.removeSocialLink = function(button) {
    const socialLinkRow = button.closest('.social-link-row');
    if (socialLinkRow) {
        socialLinkRow.remove();
        console.log('🗑️ Social link removed');
    }
};

// Setup Event Listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', handleLogout);
    
    // Save & Next buttons (support multiple buttons across tabs)
    const saveNextBtns = document.querySelectorAll('.btn-save-next');
    saveNextBtns.forEach(btn => btn.addEventListener('click', handleSaveNext));
    
    // Tab switching
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', handleTabClick);
    });

    // Logo upload
    elements.logoUploadArea.addEventListener('click', () => {
        elements.logoInput.click();
    });
    
    elements.logoInput.addEventListener('change', (e) => {
        handleImageUpload(e, 'logo');
    });

    // Banner upload
    elements.bannerUploadArea.addEventListener('click', () => {
        elements.bannerInput.click();
    });
    
    elements.bannerInput.addEventListener('change', (e) => {
        handleImageUpload(e, 'banner');
    });

    // Drag and drop for logo
    setupDragAndDrop(elements.logoUploadArea, elements.logoInput, 'logo');
    
    // Drag and drop for banner
    setupDragAndDrop(elements.bannerUploadArea, elements.bannerInput, 'banner');

    // Form auto-save
    if (elements.companyInfoForm) {
        elements.companyInfoForm.addEventListener('input', debounce(saveFormData, 500));
    }
    
    // Founding Info form auto-save
    if (elements.foundingInfoForm) {
        elements.foundingInfoForm.addEventListener('input', debounce(saveFormData, 500));
        elements.foundingInfoForm.addEventListener('change', debounce(saveFormData, 500));
    }

    // Contact form auto-save
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('input', debounce(saveFormData, 500));
        contactForm.addEventListener('change', debounce(saveFormData, 500));
    }

    // Finish Editing button
    const finishBtn = document.querySelector('.btn-finish');
    if (finishBtn) {
        finishBtn.addEventListener('click', handleFinishEditing);
    }

    // Previous buttons
    const previousBtns = document.querySelectorAll('.btn-previous');
    previousBtns.forEach(btn => {
        btn.addEventListener('click', handlePrevious);
    });
}

// Handle Tab Click
function handleTabClick(e) {
    const targetTab = e.currentTarget.dataset.tab;
    
    // Update active states
    elements.tabBtns.forEach(btn => btn.classList.remove('active'));
    elements.tabPanes.forEach(pane => pane.classList.remove('active'));
    
    e.currentTarget.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
    
    state.currentTab = targetTab;
    
        console.log(`📑 Switched to ${targetTab} tab`);
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        window.location.href = './login.html';
    }
}

// Handle Save & Next
function handleSaveNext() {
    // Save current form data
    saveFormData();
    
    // Get current tab index
    const tabs = Array.from(elements.tabBtns);
    const currentIndex = tabs.findIndex(btn => btn.classList.contains('active'));
    
    // Move to next tab
    if (currentIndex < tabs.length - 1) {
        tabs[currentIndex + 1].click();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Show success message
        showAlert('Progress saved successfully!');
    } else {
        // Last tab - show completion message
        alert('All sections completed! Your company profile is ready.');
    }
}

// Handle Finish Editing
function handleFinishEditing() {
    // Save current form data
    saveFormData();
    
    // Calculate final progress
    const finalProgress = calculateProgress();
    
    // Show completion message
    alert(`Company profile completed! ${finalProgress}% of information filled.`);
    
    // Log completion
    console.log('✅ Company profile editing finished!');
    console.log('📊 Final Data:', state.formData);
    
    // Optional: Show success message
    showAlert('Company profile saved successfully!');
}

// Handle Previous
function handlePrevious() {
    // Save current form data
    saveFormData();
    
    // Get current tab index
    const tabs = Array.from(elements.tabBtns);
    const currentIndex = tabs.findIndex(btn => btn.classList.contains('active'));
    
    // Move to previous tab
    if (currentIndex > 0) {
        tabs[currentIndex - 1].click();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Setup Drag and Drop
function setupDragAndDrop(dropArea, fileInput, type) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('dragover');
        });
    });

    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            handleImageUpload({ target: { files: files } }, type);
        }
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Handle Image Upload
function handleImageUpload(e, type) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPEG, PNG, etc.)');
        return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
    }
    
    // Read and display image
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const imageUrl = event.target.result;
        
        if (type === 'logo') {
            elements.logoPreview.src = imageUrl;
            const container = elements.logoUploadArea.querySelector('.image-preview-container');
            const placeholder = elements.logoUploadArea.querySelector('.upload-placeholder');
            container.style.display = 'flex';
            placeholder.style.display = 'none';
            state.formData.logo = imageUrl;
        } else if (type === 'banner') {
            elements.bannerPreview.src = imageUrl;
            const container = elements.bannerUploadArea.querySelector('.image-preview-container');
            const placeholder = elements.bannerUploadArea.querySelector('.upload-placeholder');
            container.style.display = 'flex';
            placeholder.style.display = 'none';
            state.formData.banner = imageUrl;
        }
        
        saveFormData();
        showAlert('File uploaded successfully!');
        console.log(`✅ ${type} image uploaded successfully`);
    };
    
    reader.readAsDataURL(file);
}

// Save Form Data
function saveFormData() {
    // Company Info
    const companyName = document.getElementById('companyName')?.value || '';
    const aboutUs = document.getElementById('aboutUs')?.value || '';
    
    // Founding Info
    const organizationType = document.getElementById('organizationType')?.value || '';
    const industryType = document.getElementById('industryType')?.value || '';
    const teamSize = document.getElementById('teamSize')?.value || '';
    const establishmentYear = document.getElementById('establishmentYear')?.value || '';
    const companyWebsite = document.getElementById('companyWebsite')?.value || '';
    const companyVision = document.getElementById('companyVision')?.value || '';
    
    // Contact Info
    const mapLocation = document.getElementById('mapLocation')?.value || '';
    const contactPhone = document.getElementById('contactPhone')?.value || '';
    const contactEmail = document.getElementById('contactEmail')?.value || '';
    
    state.formData.companyName = companyName;
    state.formData.aboutUs = aboutUs;
    state.formData.organizationType = organizationType;
    state.formData.industryType = industryType;
    state.formData.teamSize = teamSize;
    state.formData.establishmentYear = establishmentYear;
    state.formData.companyWebsite = companyWebsite;
    state.formData.companyVision = companyVision;
    state.formData.mapLocation = mapLocation;
    state.formData.contactPhone = contactPhone;
    state.formData.contactEmail = contactEmail;
    
    // Save to localStorage
    try {
        localStorage.setItem('hireNextCompanyData', JSON.stringify(state.formData));
        calculateProgress();
        console.log('💾 Form data saved');
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Load Saved Data
function loadSavedData() {
    try {
        const savedData = localStorage.getItem('hireNextCompanyData');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Restore logo
            if (data.logo) {
                elements.logoPreview.src = data.logo;
                const container = elements.logoUploadArea.querySelector('.image-preview-container');
                const placeholder = elements.logoUploadArea.querySelector('.upload-placeholder');
                container.style.display = 'flex';
                placeholder.style.display = 'none';
                state.formData.logo = data.logo;
            }
            
            // Restore banner
            if (data.banner) {
                elements.bannerPreview.src = data.banner;
                const container = elements.bannerUploadArea.querySelector('.image-preview-container');
                const placeholder = elements.bannerUploadArea.querySelector('.upload-placeholder');
                container.style.display = 'flex';
                placeholder.style.display = 'none';
                state.formData.banner = data.banner;
            }
            
            // Restore form fields - Company Info
            if (data.companyName) {
                document.getElementById('companyName').value = data.companyName;
            }
            
            if (data.aboutUs) {
                document.getElementById('aboutUs').value = data.aboutUs;
            }
            
            // Restore form fields - Founding Info
            if (data.organizationType) {
                document.getElementById('organizationType').value = data.organizationType;
            }
            
            if (data.industryType) {
                document.getElementById('industryType').value = data.industryType;
            }

            if (data.teamSize) {
                document.getElementById('teamSize').value = data.teamSize;
            }

            if (data.establishmentYear) {
                document.getElementById('establishmentYear').value = data.establishmentYear;
            }

            if (data.companyWebsite) {
                document.getElementById('companyWebsite').value = data.companyWebsite;
            }
            
            if (data.companyVision) {
                document.getElementById('companyVision').value = data.companyVision;
            }

            // Restore form fields - Contact Info
            if (data.mapLocation) {
                document.getElementById('mapLocation').value = data.mapLocation;
            }

            if (data.contactPhone) {
                document.getElementById('contactPhone').value = data.contactPhone;
            }

            if (data.contactEmail) {
                document.getElementById('contactEmail').value = data.contactEmail;
            }
            
            state.formData = { ...state.formData, ...data };
            console.log('📂 Previous data restored');
        }
    } catch (error) {
        console.warn('Could not load saved data:', error);
    }
}

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

console.log('📋 HireNext Company Information Module Loaded');

