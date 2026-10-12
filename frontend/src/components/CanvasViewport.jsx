import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Maximize2, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';

export default function CanvasViewport({ 
  currentJob, 
  activeImage, 
  loading, 
  stageInfo,
  onSelectPrompt 
}) {
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleCopyPrompt = () => {
    if (!activeImage?.prompt) return;
    navigator.clipboard.writeText(activeImage.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeImage?.imagePath) return;
    const a = document.createElement('a');
    a.href = activeImage.imagePath;
    a.download = `evo-art-${activeImage.jobId || Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 1. Loading Pipeline Visualizer
  if (loading) {
    const isPending = stageInfo?.status === 'pending';
    const isProcessing = stageInfo?.status === 'processing';

    return (
      <div className="canvas-card">
        <div className="pipeline-progress-box">
          <div style={{ position: 'relative' }}>
            <div className="canvas-empty-icon animate-spin" style={{ margin: 0, width: '84px', height: '84px' }}>
              <Sparkles size={36} />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>
              {isPending ? 'Job Dispatched & Queued (202 Accepted)' : 'Asynchronous Worker Processing'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Backend non-blocking queue is generating your high-fidelity asset.
            </p>
          </div>

          {/* Stepper tracker */}
          <div className="pipeline-steps">
            <div className={`pipeline-step-item ${isPending || isProcessing ? 'completed' : ''}`}>
              <div className="step-indicator-bubble">1</div>
              <span>Dispatched</span>
            </div>
            <div className={`pipeline-step-item ${isProcessing ? 'active' : ''}`}>
              <div className="step-indicator-bubble">2</div>
              <span>Neural Pipeline</span>
            </div>
            <div className="pipeline-step-item">
              <div className="step-indicator-bubble">3</div>
              <span>Delivered</span>
            </div>
          </div>

          <div style={{ 
            fontSize: '12px', 
            color: 'var(--accent-secondary)', 
            background: 'rgba(6, 182, 212, 0.1)', 
            padding: '6px 14px', 
            borderRadius: 'var(--radius-full)' 
          }}>
            Job ID: {stageInfo?.jobId || 'Initiating...'}
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Image Result
  if (activeImage && activeImage.imagePath) {
    return (
      <div className="canvas-card">
        <div className="active-image-container">
          <div className="image-frame">
            <img 
              src={activeImage.imagePath} 
              alt={activeImage.prompt || 'Generated art'} 
              onClick={() => setLightboxOpen(true)}
              style={{ cursor: 'zoom-in' }}
            />

            <div className="image-overlay-actions">
              <button 
                className="action-icon-btn" 
                onClick={handleCopyPrompt} 
                title="Copy prompt"
              >
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              </button>

              <button 
                className="action-icon-btn" 
                onClick={handleDownload} 
                title="Download asset"
              >
                <Download size={16} />
              </button>

              <button 
                className="action-icon-btn" 
                onClick={() => setLightboxOpen(true)} 
                title="Inspect in Lightbox"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>

          {/* Metadata details bar */}
          <div className="image-meta-bar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '70%' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prompt</span>
              <strong style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeImage.prompt}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'right' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Cost</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>
                  +${(activeImage.simulatedCost || 0.002).toFixed(4)}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Status</span>
                <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div className="modal-backdrop" onClick={() => setLightboxOpen(false)}>
            <div className="modal-content" style={{ maxWidth: '900px', padding: '16px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Job ID: {activeImage.jobId}</span>
                <button className="modal-close-btn" onClick={() => setLightboxOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <img 
                src={activeImage.imagePath} 
                alt={activeImage.prompt} 
                style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '75vh', objectFit: 'contain' }} 
              />
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{activeImage.prompt}</p>
                <button className="site-badge-btn" onClick={handleDownload}>
                  <Download size={14} /> Download File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Welcome / Empty Showcase State
  return (
    <div className="canvas-card">
      <div className="canvas-empty-state">
        <div className="canvas-empty-icon">
          <Sparkles size={32} />
        </div>
        <h3>Creative Canvas Awaiting Prompt</h3>
        <p>
          Configure your prompt on the left to start generating artwork. Generations are processed asynchronously via non-blocking background workers.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <span className="brand-badge">Async 202 Queue</span>
          <span className="brand-badge">SafetyGuard Filter</span>
          <span className="brand-badge">Multi-Tenant Quota</span>
        </div>
      </div>
    </div>
  );
}
