import React, { useEffect, useRef } from 'react'
import Sidebar from '../layouts/Sidebar'
import MainContent from '../layouts/MainContent'
import styles from './ResumePage.module.css'
import AnimatedGridOverlay from '../layouts/AnimatedGridOverlay'

export default function ResumePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={styles.container} style={{ position: "relative" }}>
      <AnimatedGridOverlay containerRef={containerRef} />
      <Sidebar />
      <MainContent />
    </div>
  )
}
