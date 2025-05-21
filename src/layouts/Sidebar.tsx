import React from 'react'
import styles from './Sidebar.module.css'
import ProfileCard from '../components/organisms/ProfileCard'
import ContactCard from '../components/organisms/ContactCard'
import SkillsCard from '../components/organisms/SkillsCard'
import CoolStuffCard from '../components/organisms/CoolStuffCard'
// ...import the other sections when ready...

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <ProfileCard />
      <ContactCard />
      <SkillsCard />
      <CoolStuffCard />
      {/* <KnowledgeSection /> */}
      {/* <LanguagesSection /> */}
      {/* <SocialSection /> */}
      {/* <HobbiesSection /> */}
    </aside>
  )
}
