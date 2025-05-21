import React, { useState } from 'react';
import Card from '../atoms/Card';
import LorenzAttractorViewer from './LorenzAttractorViewer';
import AppViewerModal from './AppViewerModal';
import styles from './CoolStuffCard.module.css';

export default function CoolStuffCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card title="Cool Stuff">
        <ul className={styles.list}>
          <li>
            <button
              onClick={() => setOpen(true)}
              className={styles.sendButton}            >
              Lorenz Attractor
            </button>
          </li>
        </ul>
      </Card>

      {/* Portal‑based modal pops above entire page */}
      <AppViewerModal isOpen={open} 
          onClose={() => setOpen(false)} title="Lorenz Attractor">
        <LorenzAttractorViewer />
      </AppViewerModal>
    </>
  );
}