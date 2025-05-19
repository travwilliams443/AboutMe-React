import React from 'react'
import Card from '../atoms/Card'

export default function ContactSection() {
  return (
    <Card title="Contact">
      <ul className="no-list">
        <li>📧 justinfolly123@gmail.com</li>
        <li>📞 +1 (123) 456‑7890</li>
        <li>🌐 www.yoursitename.com</li>
        <li>📍 New York</li>
      </ul>
    </Card>
  )
}
