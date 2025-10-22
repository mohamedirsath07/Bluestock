import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';

const ImageUploader = ({ label, hint, imageUrl, onUpload, onRemove, aspectRatio = '1/1' }) => {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setLoading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        await onUpload(base64Data);
        toast.success('Image uploaded successfully!');
        setLoading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} mb={1}>
        {label}
      </Typography>
      <Paper
        elevation={0}
        sx={{
          border: dragActive ? '2px dashed #3B82F6' : '2px dashed #E5E7EB',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: dragActive ? '#EFF6FF' : '#FAFAFA',
          cursor: 'pointer',
          position: 'relative',
          aspectRatio: aspectRatio,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !imageUrl && !loading && document.getElementById(`file-input-${label}`).click()}
      >
        <input
          type="file"
          id={`file-input-${label}`}
          accept="image/*"
          hidden
          onChange={(e) => handleFileChange(e.target.files[0])}
        />

        {loading ? (
          <CircularProgress />
        ) : imageUrl ? (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={imageUrl}
              alt={label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Delete color="error" />
            </IconButton>
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: '#9CA3AF', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              <strong style={{ color: '#3B82F6', cursor: 'pointer' }}>Browse photo</strong> or drop here
            </Typography>
            <Typography variant="caption" color="text.secondary" mt={1} display="block">
              {hint}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ImageUploader;
