import React from 'react'
import Card from '../atoms/Card'
import styles from './SkillsCard.module.css'

const skillGroups = [
  {
    title: 'Software',
    items: ['React', 'Python', 'Node.js', 'SQL', 'CI/CD'],
  },
  {
    title: 'AI Systems',
    items: ['LLMs', 'RAG', 'Vector Databases', 'Multi-Agent Systems'],
  },
  {
    title: 'Cloud',
    items: ['AWS', 'EC2', 'Amplify', 'CloudFormation', 'SysOps'],
  },
  {
    title: 'Automation',
    items: ['PLCs', 'Microcontrollers', 'Control Systems'],
  },
]

export default function SkillsCard() {
  return (
    <Card title="Skills">
      <div className={styles.grid}>
        {skillGroups.map((group) => (
          <section key={group.title} className={styles.group}>
            <h3 className={styles.heading}>{group.title}</h3>
            <p className={styles.items}>{group.items.join(' • ')}</p>
          </section>
        ))}
      </div>
    </Card>
  )
}
