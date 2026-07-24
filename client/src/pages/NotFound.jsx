import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div
      className="bg-farm-gradient"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 20,
      }}
    >
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Sprout size={44} style={{ color: 'var(--primary)', marginBottom: 18 }} />
        <h1 style={{ fontSize: 64, fontFamily: 'var(--font-heading)', marginBottom: 4 }}>404</h1>
        <p style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 26 }}>
          This field hasn't been planted yet — the page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button icon={ArrowLeft}>Back to Home</Button>
        </Link>
      </motion.div>
    </div>
  );
}
