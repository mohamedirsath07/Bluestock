import api from './axios';

// Authentication APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  sendOTP: (phone) => api.post('/auth/otp/send', { phone }),
  verifyOTP: (phone, otpCode) => api.post('/auth/otp/verify', { phone, otpCode }),
};

// Company APIs
export const companyAPI = {
  getCompany: () => api.get('/company'),
  updateCompany: (data) => api.put('/company', data),
  uploadImage: (imageType, imageData) => api.post('/company/upload', { imageType, imageData }),
  addSocialLink: (platform, profileUrl) => api.post('/company/social', { platform, profileUrl }),
  deleteSocialLink: (linkId) => api.delete(`/company/social/${linkId}`),
};
