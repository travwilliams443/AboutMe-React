import React from 'react'
import styles from './ExperienceSection.module.css'
import Card from '../atoms/Card'

export default function ExperienceSection() {
  return (
    <Card title="Experience">

      <article className={styles.item}>
        <h3 className={styles.title}>
          Senior UI Designer — Blue Moon Consultancy Studio
        </h3>
        <p className={styles.meta}>Aug 2020 – Present, New York</p>
        <p className={styles.desc}>
          Product team to prototype, design and deliver the UI/UX experience
          with a lean design process: research, design, test, and iterate.
        </p>
      </article>

      <article className={styles.item}>
        <h3 className={styles.title}>
          Senior UX Designer — Black Yark Product Design
        </h3>
        <p className={styles.meta}>Aug 2015 – Aug 2020, New York</p>
        <p className={styles.desc}>
          Led the UI design and design system, collaborating with product &
          development teams to improve product interfaces and experiences.
        </p>
      </article>
    </Card>
  )
}
