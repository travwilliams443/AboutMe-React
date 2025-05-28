import React from 'react'
import Card from '../atoms/Card'
import styles from './SkillsCard.module.css'

export default function SkillsCard() {
    return (
        <Card title="Skills">
            <p className={styles.inline}>
                AWS Certified Solutions Architect Associate • AWS SysOps Administrator Associate • Microsoft Azure Fundamentals • Python • Java • PLC Ladder Logic • SQL Server • Oscilloscopes • DMMs
            </p>
        </Card>
    )
}
