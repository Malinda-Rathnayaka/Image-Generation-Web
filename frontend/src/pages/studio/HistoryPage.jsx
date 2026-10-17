import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchJobHistory } from '../../api/jobApi';
import { BASE_URL } from '../../api/axiosClient';
import { 
  ImageIcon, 
  Search, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function HistoryPage() {
  const { apiKey, userId } = useOutletContext();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const loadAllHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchJobHistory(apiKey, userId);
      setJobs(data);
    } catch (err) {
      console.warn('Failed to load gallery history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllHistory();
  }, [apiKey, userId]);

  const filteredJobs = jobs.filter(job => 
    job.prompt?.toLowerCase().includes(search.toLowerCase()) ||
    job.jobId?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyPrompt = (prompt, id) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="gallery-page-container">
      {/* Header bar */}
      <div className="gallery-header-bar">
        <div>
          <h2>Art Creation Gallery</h2>
          <p>Explore, inspect, and export your high-fidelity generated visual assets</p>
        </div>

        <div className="gallery-controls">
          <div className="gallery-search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text"
              placeholder="Search prompts or job IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button 
            className="gallery-refresh-btn" 
            onClick={loadAllHistory}
            disabled={loading}
            title="Refresh creations"
          >
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="gallery-loading">
          <div className="spinner-orbit"></div>
          <p>Retrieving neural renders...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="gallery-empty-state">
          <div className="empty-icon-bubble">
            <ImageIcon size={40} />
          </div>
          <h3>No Rendered Artworks Found</h3>
          <p>
            {search 
              ? `No creations match your search query "${search}".` 
              : "You haven't generated any visual jobs yet. Go to the Studio to generate your first piece!"}
          </p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredJobs.map((job) => {
            const rawUrl = job.imagePath ? (job.imagePath.startsWith('http') ? job.imagePath : `${BASE_URL}${job.imagePath}`) : null;

            return (
              <div 
                key={job.jobId} 
                className="gallery-card"
                onClick={() => rawUrl && setSelectedImage({ ...job, fullUrl: rawUrl })}
              >
                <div className="gallery-thumbnail-wrap">
                  {rawUrl ? (
                    <img 
                      src={rawUrl} 
                      alt={job.prompt} 
                      className="gallery-img"
                      loading="lazy" 
                    />
                  ) : (
                    <div className="gallery-placeholder">
                      <ImageIcon size={32} />
                      <span>{job.status}</span>
                    </div>
                  )}
                  <span className={`status-pill ${job.status}`}>
                    {job.status}
                  </span>
                </div>

                <div className="gallery-card-content">
                  <p className="gallery-prompt-text">{job.prompt}</p>
                  
                  <div className="gallery-meta-footer">
                    <span className="gallery-date">
                      <Calendar size={12} />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>

                    <button 
                      className="btn-icon-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPrompt(job.prompt, job.jobId);
                      }}
                      title="Copy prompt"
                    >
                      {copiedId === job.jobId ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Modal */}
      {selectedImage && (
        <div className="image-inspect-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="image-inspect-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-preview-stage">
              <img src={selectedImage.fullUrl} alt={selectedImage.prompt} />
            </div>

            <div className="modal-details-panel">
              <div className="modal-details-header">
                <span className="badge-category">PROMPT DETAIL</span>
                <button className="btn-close-modal" onClick={() => setSelectedImage(null)}>✕</button>
              </div>

              <div className="modal-prompt-quote">
                "{selectedImage.prompt}"
              </div>

              <div className="modal-meta-grid">
                <div className="meta-cell">
                  <span className="cell-label">Job ID</span>
                  <span className="cell-value monospace">{selectedImage.jobId}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">Status</span>
                  <span className="cell-value">{selectedImage.status}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">Dimensions</span>
                  <span className="cell-value">
                    {selectedImage.options?.width || 512} × {selectedImage.options?.height || 512}
                  </span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">Date Created</span>
                  <span className="cell-value">
                    {new Date(selectedImage.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="modal-actions-row">
                <a 
                  href={selectedImage.fullUrl} 
                  download={`evo-art-${selectedImage.jobId}.png`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-primary-action"
                >
                  <Download size={16} />
                  <span>Download Artwork</span>
                </a>

                <button 
                  className="btn-secondary-action"
                  onClick={() => handleCopyPrompt(selectedImage.prompt, 'modal')}
                >
                  {copiedId === 'modal' ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  <span>{copiedId === 'modal' ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
