import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, asset } from '../services/api';
import { Link } from 'react-router-dom';

export default function Account() {
  const {
    user,
    updateUser,
  } = useAuth();

  const [f, setF] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    password: '',
  });

  const [avatarFile, setAvatarFile] =
    useState(null);

  const [preview, setPreview] =
    useState(user?.avatar || '');

  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState('');

  const isCreator =
    user?.role === 'creator' ||
    user?.role === 'admin';

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append(
        'fullName',
        f.fullName
      );

      formData.append(
        'email',
        f.email
      );

      formData.append(
        'password',
        f.password
      );

      if (isCreator) {
        formData.append(
          'bio',
          f.bio
        );
      }

      if (avatarFile) {
        formData.append(
          'avatar',
          avatarFile
        );
      }

      const d = await api(
        '/users/profile',
        {
          method: 'PUT',
          body: formData,
        }
      );

      updateUser(d.user);

      setMsg(d.message);

      setEdit(false);

      setAvatarFile(null);

      setF({
        fullName: d.user.name || '',
        email: d.user.email || '',
        bio: d.user.bio || '',
        password: '',
      });

      if (d.user.avatar) {
        setPreview(
          asset(d.user.avatar)
        );
      }

    } catch (e) {
      setMsg(e.message);
    }
  };

  const cancelEdit = () => {
    setEdit(false);

    setAvatarFile(null);

    setF({
      fullName: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      password: '',
    });

    setPreview(
      user?.avatar
        ? asset(user.avatar)
        : ''
    );
  };

  return (
    <section className="account section">

      <div className="account-header">
        <div>
          <p className="eyebrow">
            Your Profile
          </p>

          <h1>
            Welcome, {user.username}
          </h1>
        </div>

        <div className="profile-avatar-wrap">
          {preview ? (
            <img
              src={
                preview.startsWith('blob:')
                  ? preview
                  : asset(preview)
              }
              alt={user.username}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder">
              {user.username
                ?.charAt(0)
                ?.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {msg && (
        <div className="notice">
          {msg}
        </div>
      )}

      <div className="account-grid">

        {/* PROFILE */}
        <div className="panel">

          <h2>Personal Information</h2>

          <form onSubmit={save}>

            <label>
              Profile Picture

              {edit && (
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={
                    handleAvatarChange
                  }
                />
              )}
            </label>

            <label>
              Full Name

              <input
                readOnly={!edit}
                value={f.fullName}
                onChange={(e) =>
                  setF({
                    ...f,
                    fullName:
                      e.target.value,
                  })
                }
              />
            </label>

            <label>
              Email

              <input
                readOnly={!edit}
                value={f.email}
                onChange={(e) =>
                  setF({
                    ...f,
                    email:
                      e.target.value,
                  })
                }
              />
            </label>

            {isCreator && (
              <label>
                Creator Bio

                <textarea
                  className="profile-bio"
                  readOnly={!edit}
                  maxLength={500}
                  value={f.bio}
                  placeholder="Tell readers a little about yourself..."
                  onChange={(e) =>
                    setF({
                      ...f,
                      bio:
                        e.target.value,
                    })
                  }
                />

                {edit && (
                  <small className="bio-count">
                    {f.bio.length}/500
                  </small>
                )}
              </label>
            )}

            {edit && (
              <label>
                Enter Password to Confirm Changes

                <input
                  type="password"
                  value={f.password}
                  onChange={(e) =>
                    setF({
                      ...f,
                      password:
                        e.target.value,
                    })
                  }
                />
              </label>
            )}

            <div className="actions">

              {!edit ? (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() =>
                    setEdit(true)
                  }
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    className="link-btn green"
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    className="link-btn red"
                    onClick={
                      cancelEdit
                    }
                  >
                    Cancel
                  </button>
                </>
              )}

            </div>

          </form>
        </div>

        {/* QUICK ACTIONS */}
        <div className="panel">

          <h2>Quick Actions</h2>

          <div className="quick">

            <Link to="/orders">
              Your Orders
              <span>→</span>
            </Link>

            <Link to="/wishlist">
              Saved Books
              <span>→</span>
            </Link>

            <Link to="/history">
              Reading History
              <span>→</span>
            </Link>

            {user.role !== 'reader' && (
              <Link to="/creator">
                Creator Dashboard
                <span>→</span>
              </Link>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}