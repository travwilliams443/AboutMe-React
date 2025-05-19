import React from 'react'
import styles from './Sidebar.module.css'
import ProfileCard from '../components/organisms/ProfileCard'
import ContactSection from '../components/organisms/ContactSection'
// ...import the other sections when ready...

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <ProfileCard />
      <ContactSection />
      {/* <KnowledgeSection /> */}
      {/* <LanguagesSection /> */}
      {/* <SocialSection /> */}
      {/* <HobbiesSection /> */}
    </aside>
  )
}
