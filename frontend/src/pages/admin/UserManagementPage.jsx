import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchUsers, 
  fetchAdminStats, 
  updateUser, 
  deleteUser 
} from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Shield, 
  Calendar,
  Layers,
  Coins
} from 'lucide-react';

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('user');
  const [editStatus, setEditStatus] = useState('active');
  const [editCredits, setEditCredits] = useState(50);
  const [updating, setUpdating] = useState(false);

  // Delete Modal State
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Alerts
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetchAdminStats();
      if (res?.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.warn('Failed to load stats:', err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchUsers({
        page,
        limit: 10,
        search: search.trim() || undefined,
        role: roleFilter,
        status: statusFilter
      });
      if (res?.success) {
        setUsers(res.users);
        setTotalPages(res.pages);
        setTotalCount(res.total);
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setEditRole(targetUser.role);
    setEditStatus(targetUser.status);
    setEditCredits(targetUser.credits ?? 50);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    try {
      const res = await updateUser(editingUser._id || editingUser.id, {
        role: editRole,
        status: editStatus,
        credits: Number(editCredits)
      });

      if (res?.success) {
        showNotification('success', `User '${editingUser.name}' updated successfully.`);
        setEditingUser(null);
        loadUsers();
        loadStats();
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update user.');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setDeleting(true);
    try {
      const res = await deleteUser(deletingUser._id || deletingUser.id);
      if (res?.success) {
        showNotification('success', res.message || 'User deleted successfully.');
        setDeletingUser(null);
        loadUsers();
        loadStats();
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header-bar">
        <div>
          <div className="admin-title-badge">
            <ShieldCheck size={16} />
            <span>ADMINISTRATOR CONSOLE</span>
          </div>
          <h2>User Management & Governance</h2>
          <p>Supervise registered user accounts, assign roles, manage access statuses, and allocate generation quotas.</p>
        </div>

        <button 
          className="gallery-refresh-btn" 
          onClick={() => { loadUsers(); loadStats(); }}
          disabled={loading}
          title="Refresh table"
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {notification && (
        <div className={`admin-notification-toast ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-card-icon-wrap users-icon">
            <Users size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Users</span>
            <span className="stat-digit">{stats?.totalUsers ?? '...'}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon-wrap active-icon">
            <UserCheck size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Active Users</span>
            <span className="stat-digit">{stats?.activeUsers ?? '...'}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon-wrap admin-icon">
            <ShieldCheck size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Admins</span>
            <span className="stat-digit">{stats?.adminUsers ?? '...'}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon-wrap jobs-icon">
            <Sparkles size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Generations</span>
            <span className="stat-digit">{stats?.totalJobs ?? '...'}</span>
          </div>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="toolbar-search">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="toolbar-filters">
          <div className="filter-select-group">
            <Filter size={14} />
            <select 
              value={roleFilter} 
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Users Only</option>
            </select>
          </div>

          <div className="filter-select-group">
            <select 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="table-loading-stage">
            <div className="spinner-orbit"></div>
            <p>Fetching user accounts database...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="table-empty-stage">
            <Users size={36} color="var(--text-tertiary)" />
            <p>No user accounts found matching the criteria.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Credits</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => {
                const isCurrent = (currentUser?.id || currentUser?._id) === (item._id || item.id);

                return (
                  <tr key={item._id || item.id} className={isCurrent ? 'current-user-row' : ''}>
                    <td>
                      <div className="user-cell-meta">
                        <div className="user-table-avatar">
                          {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="user-table-name">
                            <span>{item.name}</span>
                            {isCurrent && <span className="you-chip">You</span>}
                          </div>
                          <div className="user-table-email">{item.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`badge-role-tag ${item.role === 'admin' ? 'tag-admin' : 'tag-user'}`}>
                        {item.role === 'admin' ? (
                          <><ShieldCheck size={12} /> Admin</>
                        ) : (
                          'User'
                        )}
                      </span>
                    </td>

                    <td>
                      <span className={`badge-status-tag ${item.status === 'active' ? 'active' : 'suspended'}`}>
                        ● {item.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td>
                      <div className="credits-cell">
                        <Coins size={14} color="#f59e0b" />
                        <span>{item.credits ?? 50}</span>
                      </div>
                    </td>

                    <td>
                      <span className="table-date-text">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions-group">
                        <button 
                          className="btn-table-action edit"
                          onClick={() => openEditModal(item)}
                          title="Edit user details"
                        >
                          <Edit3 size={15} />
                          <span>Manage</span>
                        </button>

                        <button 
                          className="btn-table-action delete"
                          onClick={() => setDeletingUser(item)}
                          disabled={isCurrent}
                          title={isCurrent ? 'You cannot delete yourself' : 'Delete user'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="admin-table-footer">
          <span className="table-count-summary">
            Showing {users.length} of {totalCount} registered users
          </span>

          <div className="pagination-controls">
            <button 
              className="btn-page"
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="page-current-indicator">
              Page {page} of {totalPages}
            </span>
            <button 
              className="btn-page"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="admin-modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Manage User: {editingUser.name}</h3>
              <button className="btn-close-modal" onClick={() => setEditingUser(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="admin-modal-form">
              <div className="form-group">
                <label>User Email</label>
                <input type="text" value={editingUser.email} disabled className="input-disabled" />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label htmlFor="edit-role-select">Access Role</label>
                  <select 
                    id="edit-role-select"
                    value={editRole} 
                    onChange={(e) => setEditRole(e.target.value)}
                    disabled={(currentUser?.id || currentUser?._id) === (editingUser._id || editingUser.id)}
                  >
                    <option value="user">User (Standard Access)</option>
                    <option value="admin">Admin (Full Administrative Privileges)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-status-select">Account Status</label>
                  <select 
                    id="edit-status-select"
                    value={editStatus} 
                    onChange={(e) => setEditStatus(e.target.value)}
                    disabled={(currentUser?.id || currentUser?._id) === (editingUser._id || editingUser.id)}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-credits-input">Credits Balance</label>
                <div className="input-with-icon">
                  <Coins size={18} className="field-icon" />
                  <input 
                    id="edit-credits-input"
                    type="number"
                    min="0"
                    max="100000"
                    value={editCredits}
                    onChange={(e) => setEditCredits(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary-action"
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Update Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="admin-modal-backdrop" onClick={() => setDeletingUser(null)}>
          <div className="admin-modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Delete User Account</h3>
              <button className="btn-close-modal" onClick={() => setDeletingUser(null)}>✕</button>
            </div>

            <div className="delete-modal-body">
              <p>
                Are you sure you want to permanently delete the account for <strong>{deletingUser.name}</strong> ({deletingUser.email})?
              </p>
              <p className="delete-warning-text">
                This action is permanent and will remove their authentication access immediately.
              </p>
            </div>

            <div className="admin-modal-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setDeletingUser(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-danger-action"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
