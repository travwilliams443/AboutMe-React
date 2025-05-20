import React, { useState } from 'react';
import Card from '../atoms/Card';
import ContactForm from './ContactForm';
import Modal from './Modal';
import styles from './ContactCard.module.css';

export default function ContactCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card title="Contact">
        <ul className={styles.list}>
          <li>
            🌐{' '}
            <a
              href="https://www.linkedin.com/in/travis-williams-549a4743/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              LinkedIn
            </a>
          </li>
          <li>📍 Atlanta, GA</li>
          <li>
            <button
              onClick={() => setOpen(true)}
              className={styles.sendButton}            >
              Send Email
            </button>
          </li>
        </ul>
      </Card>

      {/* Portal‑based modal pops above entire page */}
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <ContactForm />
      </Modal>
    </>
  );
}