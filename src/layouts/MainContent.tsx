import React from 'react'
import styles from './MainContent.module.css'
import ExperienceSection from '../components/organisms/ExperienceSection'
import EducationSection from '../components/organisms/EducationSection'

export default function MainContent() {
  return (
    <main className={styles.main}>
      <ExperienceSection />
      <EducationSection />
    </main>
  )
}
