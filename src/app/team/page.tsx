import React from 'react';
import styles from './team.module.css';

const TeamPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Team</h1>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <strong>Arikia Millikan</strong> - Expert in the journalism industry, Concept, Project Lead, Founder of CTRL+X UG, Writer
        </li>
        <li className={styles.listItem}>
          <strong>Hyun-Kyung (Julie) Yi</strong> - Lead developer, Full-stack engineer
        </li>
        <li className={styles.listItem}>
          <strong>Ulrike Bloch</strong> - Junior Full-Stack Developer
        </li>
        <li className={styles.listItem}>
          <strong>Emilie Drouot</strong> - Junior Full-Stack Developer
        </li>
      </ul>
    </div>
  );
}

export default TeamPage;