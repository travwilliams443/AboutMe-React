import React from 'react'
import Sidebar from '../layouts/Sidebar'
import MainContent from '../layouts/MainContent'
import styles from './ResumePage.module.css'
import AnimatedGridOverlay from '../layouts/AnimatedGridOverlay'

export default function ResumePage() {
  return (
    <div className={styles.container}>
      <AnimatedGridOverlay />
      <Sidebar />
      <MainContent />
    </div>
  )
}
