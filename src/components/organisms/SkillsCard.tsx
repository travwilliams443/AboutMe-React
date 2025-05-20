import React from 'react'
import Card from '../atoms/Card'
import styles from './SkillsCard.module.css'

export default function SkillsCard() {
    return (
        <Card title="Skills">
            <ul className={styles.list}>
                <li>AWS Certified Solutions Architect Associate</li>
                <li>AWS SysOps Administrator Associate</li>
                <li>Microsoft Azure Fundamentals</li>
                <li>Programming languages: Python, Java, PLC Ladder Logic</li>
                <li>Allen Bradley PLCs</li>
                <li>Databases: SQL Server, Oracle, AWS Aurora MySQL</li>
                <li>Equipment Troubleshooting with Oscilloscopes and DMMs</li>
            </ul>
        </Card>
    )
}
