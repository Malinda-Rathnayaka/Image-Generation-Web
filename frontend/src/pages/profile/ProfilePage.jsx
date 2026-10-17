import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/authApi';
import { 
  User, 
  Mail, 
  Shield, 
  Coins, 
  Calendar, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  LogOut 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserData, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword && newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('New password confirmation does not match.');
      return;
    }

    setSavingProfile(true);
    try {
      const payload = { name };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await updateProfile(payload);
      if (res?.success) {
        updateUserData(res.user);
        setSuccessMsg('Profile updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile.';
      setErrorMsg(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-header-banner">
        <div className="profile-hero-content">
          <div className="profile-large-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2>{user?.name}</h2>
            <div className="profile-badge-row">
              <span className={`badge-role-tag ${user?.role === 'admin' ? 'tag-admin' : 'tag-user'}`}>
                {user?.role === 'admin' ? 'System Administrator' : 'Standard Artist'}
              </span>
              <span className="badge-status-tag active">
                ● Active Account
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-overview-column">
          <div className="profile-card stat-card">
            <div className="stat-card-header">
              <Coins size={20} color="#f59e0b" />
              <span>Available Credits</span>
            </div>
            <div className="stat-card-value">{user?.credits ?? 50}</div>
            <p className="stat-card-desc">Credits recharge monthly or through workspace admin allocation.</p>
          </div>

          <div className="profile-card">
            <h3>Account Details</h3>
            <div className="profile-info-list">
              <div className="info-item">
                <span className="info-label"><Mail size={14} /> Email Address</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Shield size={14} /> Permission Role</span>
                <span className="info-value uppercase">{user?.role}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Calendar size={14} /> Member Since</span>
                <span className="info-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button className="btn-secondary-danger" onClick={logout}>
                <LogOut size={16} />
                <span>Log Out of Account</span>
              </button>
            </div>
          </div>
        </div>

        <div className="profile-card profile-form-card">
          <h3>Edit Profile Information</h3>
          <p className="card-subtext">Manage your display name and update your account security credentials</p>

          {successMsg && (
            <div className="profile-alert success">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="profile-alert error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="profile-name">Display Name</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input 
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-divider-label">
              <span>Change Password (Optional)</span>
            </div>

            <div className="form-group">
              <label htmlFor="current-pwd">Current Password</label>
              <div className="input-with-icon">
                <KeyRound size={18} className="field-icon" />
                <input 
                  id="current-pwd"
                  type="password"
                  placeholder="Required only if changing password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label htmlFor="new-pwd">New Password</label>
                <input 
                  id="new-pwd"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-pwd">Confirm New Password</label>
                <input 
                  id="confirm-pwd"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary-action"
              disabled={savingProfile}
              style={{ alignSelf: 'flex-start', marginTop: '10px' }}
            >
              <Save size={16} />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
