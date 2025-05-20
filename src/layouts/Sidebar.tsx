import React from 'react'
import styles from './Sidebar.module.css'
import ProfileCard from '../components/organisms/ProfileCard'
import ContactCard from '../components/organisms/ContactCard'
import SkillsCard from '../components/organisms/SkillsCard'
// ...import the other sections when ready...

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <ProfileCard />
      <ContactCard />
      <SkillsCard />
      {/* <KnowledgeSection /> */}
      {/* <LanguagesSection /> */}
      {/* <SocialSection /> */}
      {/* <HobbiesSection /> */}
    </aside>
  )
}
