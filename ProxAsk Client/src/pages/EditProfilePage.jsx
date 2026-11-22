import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../service/AuthService';
import { Save, ArrowLeft, UserCheck, Globe, MapPin, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put('/user/profile', formData);
      if (res.data && res.data.data) {
        updateUser(res.data.data);
        showSuccess('Profile updated successfully!');
        navigate('/profile');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/profile')}
        leftIcon={<ArrowLeft size={16} />}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        Back to Profile
      </Button>

      <Card style={{ padding: 'var(--space-8)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <Badge variant="teal" size="sm" icon={<Sparkles size={11} />}>
              PROFILE SETTINGS
            </Badge>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 var(--space-1)', color: 'var(--color-text)' }}>
            Edit Profile Information
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Customize your public presence, bio, and social links.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="First name"
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Last name"
            />
          </div>

          <Textarea
            label="Bio / Headline"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell others what you do or what you like to be asked about..."
            rows={4}
            maxLength={300}
            showCount
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g. San Francisco, CA"
            leftIcon={<MapPin size={16} />}
          />

          <Input
            label="Personal Website or Portfolio"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://yourwebsite.com"
            leftIcon={<Globe size={16} />}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Save size={16} />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProfilePage;
