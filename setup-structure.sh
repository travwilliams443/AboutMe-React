#!/usr/bin/env bash
set -e

# 1. Create directory tree
dirs=(
  src/components/atoms
  src/components/molecules
  src/components/organisms
  src/layouts
  src/pages
)

for d in "${dirs[@]}"; do
  mkdir -p "$d"
done

# 2. Create Atom files
touch src/components/atoms/Avatar.tsx \
      src/components/atoms/Icon.tsx \
      src/components/atoms/Divider.tsx \
      src/components/atoms/Text.tsx

# 3. Create Molecule files
touch src/components/molecules/ContactItem.tsx \
      src/components/molecules/BulletList.tsx \
      src/components/molecules/LanguageLine.tsx \
      src/components/molecules/SectionHeader.tsx \
      src/components/molecules/SkillBadge.tsx

# 4. Create Organism files
touch src/components/organisms/ProfileCard.tsx \
      src/components/organisms/ContactList.tsx \
      src/components/organisms/KnowledgeSection.tsx \
      src/components/organisms/SocialSection.tsx \
      src/components/organisms/HobbiesSection.tsx \
      src/components/organisms/ExperienceSection.tsx \
      src/components/organisms/EducationSection.tsx \
      src/components/organisms/SkillsSection.tsx

# 5. Create Layout and Page files
touch src/layouts/Sidebar.tsx \
      src/layouts/MainContent.tsx \
      src/pages/ResumePage.tsx

echo "✅ Project skeleton created!"
