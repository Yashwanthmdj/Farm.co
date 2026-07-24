/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  FlaskConical,
} from 'lucide-react';
import { Card, EmptyState, Badge, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { deleteSoilAnalysis, getSoilAnalysis, getSoilHistory, uploadSoilReport } from '../api/soil';

const PARAM_LABELS = {
  pH: 'pH Level',
  nitrogen: 'Nitrogen (N)',
  phosphorus: 'Phosphorus (P)',
  potassium: 'Potassium (K)',
  organicMatter: 'Organic Matter',
  calcium: 'Calcium',
  magnesium: 'Magnesium',
  sulfur: 'Sulfur',
  zinc: 'Zinc',
  iron: 'Iron',
  manganese: 'Manganese',
  copper: 'Copper',
  boron: 'Boron',
};

const STATUS_TONE = { completed: 'success', processing: 'warning', uploaded: 'neutral', failed: 'error' };

export default function Soil() {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?._id;

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const pollRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    setLoadingHistory(true);
    try {
      const data = await getSoilHistory(userId);
      setHistory(data || []);
    } catch (err) {
      toast.error('Failed to load soil analysis history.');
    } finally {
      setLoadingHistory(false);
    }
  }, [userId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const pollAnalysis = useCallback((id) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const analysis = await getSoilAnalysis(id);
        setSelected(analysis);
        if (analysis.status === 'completed' || analysis.status === 'failed') {
          clearInterval(pollRef.current);
          loadHistory();
        }
      } catch (err) {
        clearInterval(pollRef.current);
      }
    }, 3000);
  }, [loadHistory]);

  const handleFile = async (file) => {
    if (!file || !userId) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG or PDF files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB.');
      return;
    }

    const formData = new FormData();
    formData.append('soilReport', file);
    formData.append('userId', userId);

    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadSoilReport(formData, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      toast.success('Report uploaded. Analyzing...');
      setSelected({ _id: res.analysisId, status: 'processing', fileName: file.name });
      pollAnalysis(res.analysisId);
      loadHistory();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this soil analysis?')) return;
    try {
      await deleteSoilAnalysis(id);
      toast.success('Analysis deleted.');
      if (selected?._id === id) setSelected(null);
      loadHistory();
    } catch (err) {
      toast.error('Failed to delete analysis.');
    }
  };

  const params = selected?.soilParameters || {};
  const recs = selected?.recommendations || {};

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>Soil Health Analysis</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          Upload a soil test report to get AI-powered parameter extraction and recommendations.
        </p>
      </div>

      <Card
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
          background: dragOver ? 'rgba(63,163,77,0.06)' : 'var(--card)',
          textAlign: 'center',
          padding: 40,
          marginBottom: 24,
          cursor: 'pointer',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
          aria-label="Upload soil test report"
        />
        <UploadCloud size={38} style={{ color: 'var(--primary)', marginBottom: 12 }} />
        <p style={{ fontWeight: 700, marginBottom: 6 }}>
          {uploading ? `Uploading... ${progress}%` : 'Drag & drop your soil report, or click to browse'}
        </p>
        <p style={{ color: 'var(--muted)', fontSize: 12.5 }}>Supports JPEG, PNG, PDF up to 10MB</p>
        {uploading && (
          <div style={{ height: 6, background: 'var(--surface)', borderRadius: 4, marginTop: 16, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}
            />
          </div>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }} className="two-col-grid">
        <Card>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Analysis Details</h3>
          {!selected ? (
            <EmptyState icon={FlaskConical} title="Select or upload a report" description="Choose a report from history, or upload a new one." />
          ) : selected.status === 'processing' || selected.status === 'uploaded' ? (
            <div style={{ textAlign: 'center', padding: 30 }}>
              <Loader2 size={30} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: 12 }} />
              <p style={{ color: 'var(--muted)' }}>Analyzing your report — this can take a minute...</p>
            </div>
          ) : selected.status === 'failed' ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--error)' }}>
              <XCircle size={30} style={{ marginBottom: 12 }} />
              <p>{selected.errorMessage || 'Analysis failed. Please try uploading again.'}</p>
            </div>
          ) : (
            <div>
              {Object.keys(params).length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 10 }}>Soil Parameters</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                    {Object.entries(params).map(([key, value]) => (
                      <div
                        key={key}
                        style={{
                          background: 'var(--surface)',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{PARAM_LABELS[key] || key}</span>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recs.fertilizers?.length > 0 && (
                <RecommendationSection title="Fertilizer Recommendations" items={recs.fertilizers} />
              )}
              {recs.crops?.length > 0 && (
                <RecommendationSection title="Recommended Crops" items={recs.crops} isCrop />
              )}
              {recs.soilAmendments?.length > 0 && (
                <RecommendationSection title="Soil Amendments" items={recs.soilAmendments} />
              )}
            </div>
          )}
        </Card>

        <Card>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>History</h3>
          {loadingHistory ? (
            <Spinner />
          ) : history.length === 0 ? (
            <EmptyState title="No reports yet" description="Upload your first soil test report above." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 560, overflowY: 'auto' }}>
              {history.map((h) => (
                <button
                  key={h._id}
                  onClick={() => {
                    setSelected(h);
                    if (h.status === 'processing' || h.status === 'uploaded') pollAnalysis(h._id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    background: selected?._id === h._id ? 'rgba(63,163,77,0.1)' : 'var(--surface)',
                    border: selected?._id === h._id ? '1px solid var(--primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <FileText size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                        {h.fileName}
                      </p>
                      <Badge tone={STATUS_TONE[h.status] || 'neutral'} style={{ marginTop: 3 }}>
                        {h.status}
                      </Badge>
                    </div>
                  </div>
                  <button
                    aria-label={`Delete ${h.fileName}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(h._id);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function RecommendationSection({ title, items, isCrop }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h4 style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 10 }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: 'var(--surface)', padding: 14, borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <strong style={{ fontSize: 13.5 }}>{item.name}</strong>
              {isCrop && item.suitability && (
                <Badge tone={item.suitability === 'Excellent' ? 'success' : 'warning'}>{item.suitability}</Badge>
              )}
            </div>
            {item.description && <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 4 }}>{item.description}</p>}
            {item.applicationRate && (
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                <CheckCircle2 size={11} style={{ marginRight: 4, display: 'inline' }} />
                {item.applicationRate}
                {item.timing ? ` · ${item.timing}` : ''}
              </p>
            )}
            {item.reasons?.length > 0 && (
              <ul style={{ listStyle: 'disc', paddingLeft: 18, marginTop: 6 }}>
                {item.reasons.map((r, ri) => (
                  <li key={ri} style={{ fontSize: 12, color: 'var(--muted)' }}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
