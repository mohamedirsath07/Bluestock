// Application State
const state = {
    currentTab: 'company-info',
    formData: {
        logo: null,
        banner: null,
        companyName: '',
        aboutUs: '',
        organizationType: '',
        industryType: [],
        careersLink: '',
        companyVision: ''
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
    progressFill: document.getElementById('progressFill'),
    progressPercentage: document.getElementById('progressPercentage')
};

// Calculate Progress
function calculateProgress() {
    const fields = [
        state.formData.logo,
        state.formData.banner,
        state.formData.companyName,
        state.formData.aboutUs,
        state.formData.organizationType,
        state.formData.industryType.length > 0,
        state.formData.careersLink,
        state.formData.companyVision
    ];
    
    const filledFields = fields.filter(field => {
        if (typeof field === 'string') return field.trim() !== '';
        return field !== null && field !== false;
    }).length;
    
    const percentage = Math.round((filledFields / fields.length) * 100);
    
    elements.progressFill.style.width = `${percentage}%`;
    elements.progressPercentage.textContent = `${percentage}% Completed`;
    
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

// Setup Event Listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', handleLogout);
    
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

// Handle Image Upload
function handleImageUpload(e, type) {
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
    const industryTypeSelect = document.getElementById('industryType');
    const industryType = industryTypeSelect ? Array.from(industryTypeSelect.selectedOptions).map(opt => opt.value) : [];
    const careersLink = document.getElementById('careersLink')?.value || '';
    const companyVision = document.getElementById('companyVision')?.value || '';
    
    state.formData.companyName = companyName;
    state.formData.aboutUs = aboutUs;
    state.formData.organizationType = organizationType;
    state.formData.industryType = industryType;
    state.formData.careersLink = careersLink;
    state.formData.companyVision = companyVision;
    
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
            
            if (data.industryType && data.industryType.length > 0) {
                const select = document.getElementById('industryType');
                Array.from(select.options).forEach(option => {
                    if (data.industryType.includes(option.value)) {
                        option.selected = true;
                    }
                });
            }
            
            if (data.careersLink) {
                document.getElementById('careersLink').value = data.careersLink;
            }
            
            if (data.companyVision) {
                document.getElementById('companyVision').value = data.companyVision;
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

