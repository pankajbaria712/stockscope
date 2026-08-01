import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, Clock3, KeyRound, Lock, LogOut, Mail, PencilLine, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import PageShell from '../Components/PageShell';
import { useAuth } from '../Context/AuthContext';

function formatDate(value) {
  if (!value) return 'Unavailable';

  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Unavailable';
  }
}

function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '' });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || user.fullName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const initials = useMemo(() => {
    const source = user?.full_name || user?.fullName || user?.email || 'U';
    return String(source)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U';
  }, [user]);

  const profileName = user?.full_name || user?.fullName || 'Your name';
  const profileEmail = user?.email || 'No email on file';
  const joinedAt = formatDate(user?.created_at || user?.createdAt);
  const lastLogin = formatDate(user?.last_login || user?.lastLogin || user?.last_login_at || user?.updated_at);
  const accountStatus = user?.isVerified ? 'Verified account' : 'Active account';

  if (loading) {
    return (
      <PageShell title="Profile" heading="Your profile" description="Manage your account details in a polished workspace." badge="Settings">
        <div className="profile-loading-shell" aria-live="polite">
          <div className="profile-skeleton profile-skeleton--hero" />
          <div className="profile-grid">
            <div className="profile-skeleton profile-skeleton--content" />
            <div className="profile-skeleton profile-skeleton--content" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell title="Profile" heading="Your profile" description="Manage your account details in a polished workspace." badge="Settings">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="profile-empty-state">
          <ShieldCheck size={28} />
          <h2>No profile found</h2>
          <p>Please sign in again to continue managing your account.</p>
        </motion.div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Profile" heading="Your profile" description="Manage your account details in a polished workspace." badge="Settings">
      <div className="profile-page">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="profile-card profile-card--hero">
          <div className="profile-card__banner">
            <div className="profile-avatar-shell">
              {user.avatar ? <img src={user.avatar} alt="User avatar" className="profile-avatar" /> : <span className="profile-avatar-fallback">{initials}</span>}
              <button type="button" className="profile-avatar-button" aria-label="Change avatar">
                <Camera size={14} />
              </button>
            </div>
            <div className="profile-card__intro">
              <div className="profile-card__eyebrow">Account overview</div>
              <h2>{profileName}</h2>
              <p>{profileEmail}</p>
              <div className="profile-pill-row">
                <span className="profile-pill profile-pill--success"><CheckCircle2 size={14} /> {accountStatus}</span>
                <span className="profile-pill"><ShieldCheck size={14} /> Protected</span>
              </div>
            </div>
          </div>

          <div className="profile-actions-row">
            <button type="button" className="primary-button" onClick={() => setIsEditing((value) => !value)}>
              <PencilLine size={16} /> {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button type="button" className="secondary-button" onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </motion.section>

        <div className="profile-grid">
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="profile-card">
            <div className="profile-card__section-title">
              <div>
                <p className="page-badge">Personal details</p>
                <h3>Account information</h3>
              </div>
              <span className="profile-badge">Member</span>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-item">
                <span><UserRound size={16} /> Full name</span>
                <strong>{profileName}</strong>
              </div>
              <div className="profile-info-item">
                <span><Mail size={16} /> Email</span>
                <strong>{profileEmail}</strong>
              </div>
              <div className="profile-info-item">
                <span><Clock3 size={16} /> Joined</span>
                <strong>{joinedAt}</strong>
              </div>
              <div className="profile-info-item">
                <span><ShieldCheck size={16} /> Last login</span>
                <strong>{lastLogin}</strong>
              </div>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="profile-card">
            <div className="profile-card__section-title">
              <div>
                <p className="page-badge">Security</p>
                <h3>Change password</h3>
              </div>
              <span className="profile-badge profile-badge--accent"><Sparkles size={14} /> Protected</span>
            </div>

            {isEditing ? (
              <div className="profile-form">
                <label>
                  <span>Full name</span>
                  <input value={formData.fullName} onChange={(event) => setFormData((value) => ({ ...value, fullName: event.target.value }))} placeholder="Enter your full name" />
                </label>
                <label>
                  <span>Email</span>
                  <input value={formData.email} onChange={(event) => setFormData((value) => ({ ...value, email: event.target.value }))} placeholder="Enter your email" />
                </label>
                <div className="profile-form__hint">
                  <ShieldCheck size={14} /> Changes will update the visible profile details instantly.
                </div>
                <button type="button" className="primary-button" onClick={() => {
                  setFeedback('Profile updates are ready for the next backend release.');
                  setIsEditing(false);
                }}>
                  Save changes
                </button>
              </div>
            ) : (
              <div className="profile-form profile-form--muted">
                <div className="profile-lock-card">
                  <Lock size={18} />
                  <p>Keep your account protected with a strong, updated password.</p>
                </div>
                <button type="button" className="secondary-button" onClick={() => setFeedback('Password updates are currently handled outside this view.')}>Update password</button>
              </div>
            )}

            {feedback ? <p className="profile-feedback">{feedback}</p> : null}

            <div className="profile-security-list">
              <div className="profile-security-item">
                <KeyRound size={16} />
                <span>Password policy</span>
              </div>
              <div className="profile-security-item">
                <ShieldCheck size={16} />
                <span>Sessions stay secure with encrypted tokens</span>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </PageShell>
  );
}

export default ProfilePage;
