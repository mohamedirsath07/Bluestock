import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  TextField,
  Grid,
  LinearProgress,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Logout, Business, Info, Share, ContactMail } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { companyAPI } from '@api/services';
import { logout } from '@store/authSlice';
import { setCompanyData } from '@store/companySlice';
import ImageUploader from '@components/ImageUploader';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const { setupProgress } = useSelector((state) => state.company);
  
  const [currentTab, setCurrentTab] = useState(0);

  // Fetch company data
  const { data: companyData, refetch } = useQuery({
    queryKey: ['company'],
    queryFn: companyAPI.getCompany,
    onSuccess: (data) => {
      dispatch(setCompanyData(data.data));
      setValue('companyName', data.data.company_name);
      setValue('aboutUs', data.data.about_us);
      setValue('organizationType', data.data.organization_type);
      setValue('industryType', data.data.industry_type);
      setValue('teamSize', data.data.team_size);
      setValue('establishmentYear', data.data.establishment_year);
      setValue('companyWebsite', data.data.company_website);
      setValue('companyVision', data.data.company_vision);
      setValue('mapLocation', data.data.map_location);
      setValue('contactPhone', data.data.contact_phone);
      setValue('contactEmail', data.data.contact_email);
    },
  });

  const { register, handleSubmit, setValue, watch } = useForm();

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: companyAPI.updateCompany,
    onSuccess: () => {
      toast.success('Company information updated successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update company information');
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: ({ imageType, imageData }) => companyAPI.uploadImage(imageType, imageData),
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    const section = searchParams.get('section');
    if (section === 'settings') {
      setCurrentTab(0);
    }
  }, [searchParams]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const handleSaveAndNext = () => {
    handleSubmit(onSubmit)();
    if (currentTab < 3) {
      setCurrentTab(currentTab + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      {/* App Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Typography variant="h6" color="white" fontWeight={700}>
                J
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Jobpilot
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', mr: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                Setup Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={setupProgress || 0}
                  sx={{ width: 120, height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {setupProgress || 0}% Completed
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
            <Tab icon={<Business />} label="Company Info" />
            <Tab icon={<Info />} label="Founding Info" />
            <Tab icon={<Share />} label="Social Media" />
            <Tab icon={<ContactMail />} label="Contact" />
          </Tabs>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Company Info Tab */}
            {currentTab === 0 && (
              <Box>
                <Typography variant="h5" fontWeight={600} mb={3}>
                  Logo & Banner Image
                </Typography>

                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} md={6}>
                    <ImageUploader
                      label="Upload Logo"
                      hint="A photo larger than 400 pixels work best. Max photo size 5 MB."
                      imageUrl={companyData?.data?.logo_url}
                      onUpload={(imageData) =>
                        uploadImageMutation.mutate({ imageType: 'logo', imageData })
                      }
                      onRemove={() => {
                        // Handle remove
                      }}
                      aspectRatio="1/1"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ImageUploader
                      label="Banner Image"
                      hint="Banner images optimal dimension 1520*400. Max photo size 5 MB."
                      imageUrl={companyData?.data?.banner_url}
                      onUpload={(imageData) =>
                        uploadImageMutation.mutate({ imageType: 'banner', imageData })
                      }
                      onRemove={() => {
                        // Handle remove
                      }}
                      aspectRatio="19/5"
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Company Name"
                  margin="normal"
                  {...register('companyName')}
                />

                <TextField
                  fullWidth
                  label="About Us"
                  margin="normal"
                  multiline
                  rows={5}
                  {...register('aboutUs')}
                />
              </Box>
            )}

            {/* Founding Info Tab */}
            {currentTab === 1 && (
              <Box>
                <Typography variant="h5" fontWeight={600} mb={3}>
                  Founding Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Organization Type"
                      margin="normal"
                      {...register('organizationType')}
                      value={watch('organizationType') || ''}
                    >
                      <MenuItem value="private">Private Limited</MenuItem>
                      <MenuItem value="public">Public Limited</MenuItem>
                      <MenuItem value="partnership">Partnership</MenuItem>
                      <MenuItem value="sole">Sole Proprietorship</MenuItem>
                      <MenuItem value="llp">LLP</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Industry Type"
                      margin="normal"
                      {...register('industryType')}
                      value={watch('industryType') || ''}
                    >
                      <MenuItem value="fintech">Fintech</MenuItem>
                      <MenuItem value="engineering">Engineering</MenuItem>
                      <MenuItem value="software">Software & IT</MenuItem>
                      <MenuItem value="edtech">Edtech</MenuItem>
                      <MenuItem value="oil-gas">Oil & Gas</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Team Size"
                      margin="normal"
                      {...register('teamSize')}
                      value={watch('teamSize') || ''}
                    >
                      <MenuItem value="1-10">1-10</MenuItem>
                      <MenuItem value="11-50">11-50</MenuItem>
                      <MenuItem value="51-200">51-200</MenuItem>
                      <MenuItem value="201-500">201-500</MenuItem>
                      <MenuItem value="501+">501+</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Year of Establishment"
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      {...register('establishmentYear')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Website"
                      margin="normal"
                      placeholder="https://example.com"
                      {...register('companyWebsite')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Company Vision"
                      margin="normal"
                      multiline
                      rows={5}
                      {...register('companyVision')}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Social Media Tab */}
            {currentTab === 2 && (
              <Box>
                <Typography variant="h5" fontWeight={600} mb={3}>
                  Social Media Profiles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Social media integration coming soon...
                </Typography>
              </Box>
            )}

            {/* Contact Tab */}
            {currentTab === 3 && (
              <Box>
                <Typography variant="h5" fontWeight={600} mb={3}>
                  Contact Information
                </Typography>

                <TextField
                  fullWidth
                  label="Map Location"
                  margin="normal"
                  {...register('mapLocation')}
                />

                <TextField
                  fullWidth
                  label="Phone"
                  margin="normal"
                  {...register('contactPhone')}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  margin="normal"
                  {...register('contactEmail')}
                />
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={currentTab === 0}
              >
                Previous
              </Button>
              
              {currentTab < 3 ? (
                <Button variant="contained" onClick={handleSaveAndNext}>
                  Save & Next
                </Button>
              ) : (
                <Button variant="contained" type="submit">
                  Finish Editing
                </Button>
              )}
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
