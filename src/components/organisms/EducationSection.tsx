import React from 'react'
import Card from '../atoms/Card'
import styles from './EducationSection.module.css'

export default function EducationSection() {
  return (
    <Card title="Education">
      <article className={styles.item}>
        <h3 className={styles.degree}>
          Bachelor of Engineering in Information Technology<br/>
          <span className={styles.institution}>SCAT Education Campus</span>
        </h3>
        <p className={styles.dates}>2011 – 2015, New York</p>
      </article>

      <article className={styles.item}>
        <h3 className={styles.degree}>
          NJIT Higher<br/>
          <span className={styles.institution}>AB Experiment Campus</span>
        </h3>
        <p className={styles.dates}>2009 – 2011, New York</p>
      </article>
    </Card>
  )
}
