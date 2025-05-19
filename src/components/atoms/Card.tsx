import React from 'react'
import styles from './Card.module.css'

interface CardProps {
  title: string
  children: React.ReactNode
}

export default function Card({ title, children }: CardProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>{title}</h2>
      {children}
    </div>
  )
}
