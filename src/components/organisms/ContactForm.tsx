import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const [state, handleSubmit] = useForm("movdbrdw");
  if (state.succeeded) {
    return (
      <p style={{ textAlign: 'center', color: '#38a169', fontWeight: '500' }}>
        Thanks for reaching out!
      </p>
    );
  }

  return (
     <form onSubmit={handleSubmit} className={styles.form}>
      <div>
        <label htmlFor="email" className={styles.label}>
          Your Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="you@example.com"
          className={`${styles.field} ${styles.input}`}
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} className={styles.error} />
      </div>

      <div>
        <label htmlFor="message" className={styles.label}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Hi — I’d love to connect about…"
          className={`${styles.field} ${styles.textarea}`}
        />        
        <ValidationError prefix="Message" field="message" errors={state.errors} className={styles.error} />
      </div>

      <input type="hidden" name="_gotcha" autoComplete="off" />

      <button type="submit" disabled={state.submitting} className={styles.button}>
        {state.submitting ? 'Sending…' : 'Submit'}
      </button>
    </form>
  );
}
