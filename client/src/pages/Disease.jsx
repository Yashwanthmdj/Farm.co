import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, X, Bug, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, Button, EmptyState, Badge, Spinner } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { analyzeDisease } from '../api/disease';

export default function Disease() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  // Always revoke the previous object URL when it changes or the component
  // unmounts, to avoid leaking memory from blob URLs.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (selected) => {
    if (!selected) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(selected.type)) {
      toast.error('Only JPEG or PNG images are supported.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setResult(null);
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    const formData = new FormData();
    formData.append('plantImage', file);
    try {
      const data = await analyzeDisease(formData);
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Disease detection failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>Crop Disease Detection</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          Upload a photo of a plant leaf to detect disease and get treatment guidance.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="two-col-grid">
        <Card>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Upload Leaf Photo</h3>
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 44,
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="sr-only"
                aria-label="Upload leaf photo"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <UploadCloud size={34} style={{ color: 'var(--primary)', marginBottom: 10 }} />
              <p style={{ fontWeight: 700 }}>Click to select a leaf photo</p>
              <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 4 }}>JPEG or PNG, up to 5MB</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={previewUrl}
                  alt="Selected leaf preview"
                  style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 'var(--radius-md)' }}
                />
                <button
                  aria-label="Remove selected image"
                  onClick={handleRemove}
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'var(--error)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={15} />
                </button>
              </div>
              <div style={{ marginTop: 18 }}>
                <Button onClick={handleAnalyze} loading={analyzing} icon={Bug} fullWidth>
                  Analyze Leaf
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Results</h3>
          {analyzing ? (
            <Spinner label="Analyzing image..." />
          ) : !result ? (
            <EmptyState icon={Bug} title="No analysis yet" description="Upload and analyze a leaf photo to see results here." />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <strong style={{ fontSize: 15 }}>{result.plantName || 'Unknown plant'}</strong>
                <Badge tone={result.isHealthy ? 'success' : 'error'} icon={result.isHealthy ? CheckCircle2 : AlertTriangle}>
                  {result.isHealthy ? 'Healthy' : 'Unhealthy'}
                </Badge>
              </div>

              {!result.isHealthy && result.diseases?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {result.diseases.map((d, i) => (
                    <div key={i} style={{ background: 'var(--surface)', padding: 14, borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--warning)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <strong style={{ fontSize: 13.5 }}>{d.name}</strong>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {Math.round((d.probability || 0) * 100)}% match
                        </span>
                      </div>
                      {d.description && <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>{d.description}</p>}
                      {d.treatment && (
                        <div style={{ fontSize: 12.5 }}>
                          {Object.entries(d.treatment).map(([method, steps]) => (
                            Array.isArray(steps) && steps.length > 0 ? (
                              <div key={method} style={{ marginBottom: 6 }}>
                                <strong style={{ textTransform: 'capitalize' }}>{method}: </strong>
                                <span style={{ color: 'var(--muted)' }}>{steps.join(', ')}</span>
                              </div>
                            ) : null
                          ))}
                        </div>
                      )}
                      {d.url && (
                        <a href={d.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: 12, marginTop: 6, fontWeight: 700 }}>
                          Learn more <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
                  No disease detected. Your plant appears healthy!
                </p>
              )}
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}
