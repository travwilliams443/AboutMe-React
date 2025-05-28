import React from 'react'
import Sidebar from '../layouts/Sidebar'
import MainContent from '../layouts/MainContent'
import styles from './ResumePage.module.css'

export default function ResumePage() {
  return (
    <div className={styles.container}>
      <Sidebar />
      <MainContent />
    </div>
  )
}
