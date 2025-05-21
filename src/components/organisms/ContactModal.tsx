import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './ContactModal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

export default function ContactModal({ isOpen, onClose, children }: ModalProps) {
    // lock background scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={`${styles.modal} ${isOpen ? styles.modalOpen : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    ×
                </button>
                {/* Header inside modal */}
                <h3 className={styles.header}>Send Me a Message</h3>
                <div className={styles.divider} />
                {/* Modal content */}
                {children}
            </div>
        </div>,
        document.body
    );
}
