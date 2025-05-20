import React from 'react'
import styles from './ExperienceSection.module.css'
import Card from '../atoms/Card'

export default function ExperienceSection() {
  return (
    <Card title="Experience">

       <article className={styles.item}>
    <h3 className={styles.title}>
      Cloud Developer/Tech Lead, Production Support — Truist Bank
    </h3>
    <p className={styles.meta}>Sep 2020 – Jan 2025, Atlanta, GA</p>
    <p className={styles.desc}>
      Led support engineering teams, optimized AWS costs, and ensured resiliency for online banking applications.
    </p>
  </article>

  <article className={styles.item}>
    <h3 className={styles.title}>
      Web Application Developer & IT Support — ProActive Exteriors
    </h3>
    <p className={styles.meta}>Sep 2019 – Sep 2020, Atlanta, GA</p>
    <p className={styles.desc}>
      Maintained internal apps, automated workflows with VBA, and enhanced web tools using AngularJS and Bootstrap.
    </p>
  </article>

  <article className={styles.item}>
    <h3 className={styles.title}>
      System Support/Analyst — Regions Bank
    </h3>
    <p className={styles.meta}>Apr 2019 – Sep 2019, Atlanta, GA</p>
    <p className={styles.desc}>
      Supported Calypso platform users, translated requirements into technical specs, and troubleshot trading system issues.
    </p>
  </article>

  <article className={styles.item}>
    <h3 className={styles.title}>
      Application Developer — SunTrust Bank (STRH Capital Markets)
    </h3>
    <p className={styles.meta}>Sep 2014 – Apr 2019, Atlanta, GA</p>
    <p className={styles.desc}>
      Developed Java/.NET solutions for Calypso, authored technical specs, and supported batch reporting applications.
    </p>
  </article>

  <article className={styles.item}>
    <h3 className={styles.title}>
      Java & PL/SQL Developer — Crawford & Company / Risk Sciences Group
    </h3>
    <p className={styles.meta}>Jan 2013 – Feb 2014, Atlanta, GA</p>
    <p className={styles.desc}>
      Modified Java and PL/SQL business logic, resolved system errors, and collaborated on multi-team projects.
    </p>
  </article>

  <article className={styles.item}>
    <h3 className={styles.title}>
      Java Application Developer — Clear2Pay Americas, Inc.
    </h3>
    <p className={styles.meta}>Jul 2012 – Dec 2012, Charlotte, NC</p>
    <p className={styles.desc}>
      Developed and tested Java code, managed data model changes, and implemented unit tests for enterprise applications.
    </p>
  </article>

  <article className={styles.item}>
    <h3 className={styles.title}>
      Application Developer — BlueCross BlueShield of South Carolina
    </h3>
    <p className={styles.meta}>Jan 2008 – Jul 2012, Columbia, SC</p>
    <p className={styles.desc}>
      Built and maintained Java/EJB and COBOL applications on WebSphere, including custom JSP tools for testing and debugging.
    </p>
  </article>

    </Card>
  )
}
