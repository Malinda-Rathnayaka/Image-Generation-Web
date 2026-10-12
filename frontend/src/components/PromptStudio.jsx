import React, { useState } from 'react';
import { 
  Wand2, 
  AlertTriangle, 
  Sliders, 
  Palette, 
  Maximize2, 
  Sparkles, 
  X,
  Layers
} from 'lucide-react';

const RESTRICTED_TERMS = ['violence', 'weapon', 'nude', 'trademark', 'brand', 'real person'];

const QUICK_INSPIRATIONS = [
  'Cybernetic neon samurai in rainy Neo-Tokyo, octane render, 8k',
  'Bioluminescent crystal owl with glowing sapphire wings, mythical fantasy',
  'Futuristic architectural villa hanging over misty emerald waterfalls',
  'Vintage 80s anime city street at twilight with retro sunset gradient',
  'Hyperdetailed isometric floating island with miniature waterfalls'
];

const STYLE_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'photoreal', label: 'Photorealistic' },
  { id: 'anime', label: 'Anime / Manga' },
  { id: '3d-render', label: '3D Octane' },
  { id: 'synthwave', label: 'Synthwave' },
  { id: 'minimalist', label: 'Minimalist' }
];

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square', width: 512, height: 512, type: 'square' },
  { id: '16:9', label: 'Landscape', width: 1024, height: 576, type: 'landscape' },
  { id: '9:16', label: 'Portrait', width: 576, height: 1024, type: 'portrait' }
];

export default function PromptStudio({ onGenerate, loading, error }) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cyberpunk');
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [transparentBg, setTransparentBg] = useState(false);

  // Real-time safety guard warning matching backend safetyGuard.js
  const detectedUnsafeTerm = RESTRICTED_TERMS.find(term => 
    prompt.toLowerCase().includes(term)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading || detectedUnsafeTerm) return;

    let finalPrompt = prompt.trim();
    if (selectedStyle !== 'none') {
      finalPrompt += `, ${selectedStyle} style`;
    }

    onGenerate({
      prompt: finalPrompt,
      options: {
        width: selectedRatio.width,
        height: selectedRatio.height,
        transparentBackground: transparentBg
      }
    });
  };

  return (
    <aside className="studio-sidebar">
      {/* Prompt Input Block */}
      <div>
        <div className="section-title">
          <span>Prompt Description</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{prompt.length} / 500</span>
        </div>

        <div className="prompt-box-wrapper">
          <textarea
            id="prompt-input"
            className="prompt-textarea"
            placeholder="Describe your vision (e.g., A cybernetic samurai standing under neon rain in neo-Tokyo...)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            maxLength={500}
          />

          <div className="prompt-footer">
            <span>Powered by Mock & Together AI Engines</span>
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Clear prompt"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Safety Warning Proactive Alert */}
        {detectedUnsafeTerm && (
          <div className="safety-alert-banner" style={{ marginTop: '12px' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Restricted keyword detected: "{detectedUnsafeTerm}"</strong>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
                The backend SafetyGuard prohibits terms such as violence, weapons, nudity, and brand trademarks. Please adjust your prompt.
              </div>
            </div>
          </div>
        )}

        {/* Backend API Error Banner */}
        {error && (
          <div className="safety-alert-banner" style={{ marginTop: '12px' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Generation Notice</strong>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Inspirations */}
      <div>
        <div className="quick-prompts-label">
          <Sparkles size={14} color="var(--accent-secondary)" />
          <span>Quick Inspirations</span>
        </div>
        <div className="quick-prompts-tags">
          {QUICK_INSPIRATIONS.map((idea, index) => (
            <button
              key={index}
              type="button"
              className="prompt-tag-btn"
              onClick={() => setPrompt(idea)}
              disabled={loading}
            >
              {idea.slice(0, 32)}...
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio Selector */}
      <div>
        <div className="section-title">
          <span>Aspect Ratio</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{selectedRatio.width}x{selectedRatio.height}</span>
        </div>
        <div className="aspect-ratio-grid">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.id}
              type="button"
              id={`ratio-${ratio.id.replace(':', '-')}`}
              className={`ratio-btn ${selectedRatio.id === ratio.id ? 'active' : ''}`}
              onClick={() => setSelectedRatio(ratio)}
              disabled={loading}
            >
              <div className={`ratio-shape ${ratio.type}`} />
              <div className="ratio-title">{ratio.label} ({ratio.id})</div>
              <div className="ratio-res">{ratio.width}x{ratio.height}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Style Presets */}
      <div>
        <div className="section-title">
          <span>Artistic Style</span>
          <Palette size={14} />
        </div>
        <div className="style-chips-wrapper">
          {STYLE_PRESETS.map((st) => (
            <button
              key={st.id}
              type="button"
              className={`style-chip ${selectedStyle === st.id ? 'active' : ''}`}
              onClick={() => setSelectedStyle(st.id)}
              disabled={loading}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Options: Transparent Background */}
      <div 
        className="toggle-option"
        onClick={() => !loading && setTransparentBg(!transparentBg)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={16} color="var(--accent-secondary)" />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Transparent Background</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Generate cutout PNG layer</div>
          </div>
        </div>
        <div className={`toggle-switch ${transparentBg ? 'checked' : ''}`} />
      </div>

      {/* Submit Generate Action */}
      <button
        id="btn-generate-image"
        type="button"
        className="btn-generate"
        onClick={handleSubmit}
        disabled={loading || !prompt.trim() || !!detectedUnsafeTerm}
      >
        <Wand2 size={18} className={loading ? 'animate-spin' : ''} />
        <span>{loading ? 'Synthesizing Artwork...' : 'Generate Artwork'}</span>
        <span style={{ 
          marginLeft: 'auto', 
          fontSize: '11px', 
          background: 'rgba(0, 0, 0, 0.25)', 
          padding: '4px 8px', 
          borderRadius: 'var(--radius-full)' 
        }}>
          Est. $0.002
        </span>
      </button>
    </aside>
  );
}
