import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must match'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth(); // Added user for autofill
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form
  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  // Autofill Name and Email
  useEffect(() => {
    if (user) {
      resetProfileForm({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user, resetProfileForm]);

  // Password Form
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Failed to update profile.');
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Password change failed:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs Navigation */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-4 border-b-2 ${
              activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
            } font-medium`}
          >
            Profile Settings
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-4 border-b-2 ${
              activeTab === 'password' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
            } font-medium`}
          >
            Change Password
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-8 mt-6 rounded-lg shadow-md">
          {activeTab === 'profile' && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
              <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    {...profileRegister('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    {...profileRegister('email')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                  )}
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isProfileSubmitting}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isProfileSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </section>
          )}

          {activeTab === 'password' && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Change Password</h2>
              <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    {...passwordRegister('currentPassword')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    {...passwordRegister('newPassword')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    {...passwordRegister('confirmPassword')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Change Password Button */}
                <button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isPasswordSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;