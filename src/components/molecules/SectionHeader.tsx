import React from 'react'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  title: string
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return <h2 className={styles.header}>{title}</h2>
}
