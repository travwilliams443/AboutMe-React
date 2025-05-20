import React from 'react'
import Card from '../atoms/Card'
import styles from './EducationSection.module.css'

export default function EducationSection() {
  return (
    <Card title="Education">
      <article className={styles.item}>
        <h3 className={styles.degree}>
          Associate of Applied Science in Mechatronics (Expected Dec 2026)<br />
          <span className={styles.institution}>Gwinnett Technical College</span>
        </h3>
        <p className={styles.dates}>Lawrenceville, GA</p>
      </article>
      <article className={styles.item}>
        <h3 className={styles.degree}>
          Bachelor of Science in Mathematics<br />
          <span className={styles.institution}>University of South Carolina</span>
        </h3>
        <p className={styles.dates}>Columbia, SC</p>
      </article>
    </Card>
  )
}
