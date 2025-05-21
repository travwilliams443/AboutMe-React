import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './AppViewerModal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export default function AppViewerModal({ isOpen, onClose, title, children }: ModalProps) {
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
                <h3 className={styles.header}>{title}</h3>
                <div className={styles.divider} />
                {/* Modal content */}
                <div className={styles.modalContent}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
