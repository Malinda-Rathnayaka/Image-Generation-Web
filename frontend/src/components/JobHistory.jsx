import React from 'react';
import { History, Image as ImageIcon, ExternalLink, RefreshCw } from 'lucide-react';
import { BASE_URL } from '../api/axiosClient';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return `${BASE_URL}${path}`;
};

export default function JobHistory({ jobs, onSelectJob, onRefreshHistory, loadingHistory }) {
  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <section className="history-section">
      <div className="history-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={18} color="var(--accent-secondary)" />
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Recent Generations</h2>
          <span style={{ 
            fontSize: '11px', 
            background: 'var(--bg-input)', 
            padding: '2px 8px', 
            borderRadius: 'var(--radius-full)', 
            color: 'var(--text-muted)' 
          }}>
            {jobs.length} jobs
          </span>
        </div>

        <button 
          id="btn-refresh-history"
          className="site-badge-btn" 
          onClick={onRefreshHistory}
          title="Refresh recent jobs from MongoDB"
        >
          <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="history-grid">
        {jobs.map((job) => {
          const isCompleted = job.status === 'completed';
          const isFailed = job.status === 'failed';

          return (
            <div 
              key={job.jobId || job._id} 
              className="history-card"
              onClick={() => onSelectJob(job)}
              title="Click to view generation"
            >
              <div className="history-thumb-wrapper">
                {isCompleted && job.imagePath ? (
                  <img src={getImageUrl(job.imagePath)} alt={job.prompt} loading="lazy" />
                ) : (
                  <div style={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: isFailed ? 'var(--status-danger)' : 'var(--text-muted)' 
                  }}>
                    {isFailed ? 'Generation Failed' : 'Processing...'}
                  </div>
                )}
              </div>

              <div className="history-details">
                <span className="history-prompt">{job.prompt}</span>
                <div className="history-footer">
                  <span style={{ 
                    color: isCompleted ? 'var(--status-success)' : isFailed ? 'var(--status-danger)' : 'var(--status-warning)' 
                  }}>
                    {job.status}
                  </span>
                  <span>
                    {job.createdAt ? new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
