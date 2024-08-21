import React from 'react';
import styles from './about.module.css';

const AboutPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading1}>Web3 Hackathon CTRL+X Project</h1>
      <p className={styles.heading1}>Decentralizing the Future of Digital Publishing</p>

      <h3 className={styles.heading3}>Project: The CTRL+X Blocklicense</h3>
      <p className={styles.paragraph}>
        <strong>Link to Slides:</strong> <a className={styles.link} href="https://docs.google.com/presentation/d/1q1j6W8yQc5lN4RPGA9iAMwgvzWgKI3hQ0xQx4C9fIuA/edit#slide=id.g2d9f477f45e_1_54" target="_blank" rel="noopener noreferrer">Google Slides</a>
      </p>

      <p className={styles.paragraph}>The Blocklicense is a web3 content licensing registry and relicensing marketplace for text-based journalistic content.</p>
      <p className={styles.paragraph}>By establishing ownership of content it enables downstream licensing transactions that extend the ownership with the permission of the author.</p>
      <p className={styles.paragraph}>CTRL+X supports the development of public benefit infrastructure that allows journalists to continue doing journalism, and widens the public’s access to journalistic content.</p>
      <p className={styles.paragraph}>CTRL+X content licensing technology facilitates the maintenance of the historical record, helps journalists collaborate with each other and better monetize their works.</p>

      <h3 className={styles.heading3}>Problem</h3>
      <p className={styles.paragraph}>Journalists can’t maintain ownership of their content in the face of Platform Collapse, which means they are subject to:</p>
      <ul className={styles.list}>
        <li className={styles.listItem}>Limited distribution</li>
        <li className={styles.listItem}>Poor monetization</li>
        <li className={styles.listItem}>Disappearing content (link rot, memory holing)</li>
      </ul>
      <p className={styles.paragraph}>This in turn creates an environment ripe for misinformation to proliferate and creates a chilling effect in the field of journalism.</p>

      <h3 className={styles.heading3}>Solution</h3>
      <p className={styles.paragraph}>CTRL+X content licensing software assigns immutable rights to authors and enables buyer/seller transactions on a per-article basis.</p>
      <p className={styles.paragraph}>A blockchain solution for digital rights management of journalistic content enables authors to:</p>
      <ul className={styles.list}>
        <li className={styles.listItem}>Enhance distribution of their articles to multiple platforms</li>
        <li className={styles.listItem}>Better monetize their published works</li>
        <li className={styles.listItem}>Future-proof their content against platform collapse</li>
      </ul>

      <h3 className={styles.heading3}>Why now?</h3>
      <p className={styles.paragraph}>The world needs quality journalism more than ever. That journalism needs INFRASTRUCTURE.</p>
      <p className={styles.paragraph}>More journalists than ever are operating independently, which means they have more legal leverage than ever to negotiate the rights to their content published through corporate media institutions.</p>
      <p className={styles.paragraph}>Without open, sustainable infrastructure, we are heading for a digital information collapse. Today’s web2 for-profit platform technology can’t support the transition underway.</p>

      <h3 className={styles.heading3}>How it works</h3>
      <h4 className={styles.heading4}>Tech Stack</h4>
      <ul className={styles.list}>
        <li className={styles.listItem}>NextJS - React framework for UX</li>
        <li className={styles.listItem}>Typescript - specifying data types</li>
        <li className={styles.listItem}>Blink (Solana) - Blockchain link - turns any Solana Action into a shareable, metadata-rich link</li>
        <li className={styles.listItem}>Metaplex - OS NFT protocol</li>
        <li className={styles.listItem}>Phantom Wallet - NFT wallet</li>
        <li className={styles.listItem}>Filecoin - Decentralized data storage network “designed to store humanity’s most important information”</li>
        <li className={styles.listItem}>(Later: Tiplink - wallet connection)</li>
      </ul>

      <h4 className={styles.heading4}>License Attributes from Creative Commons:</h4>
      <ul className={styles.list}>
        <li className={styles.listItem}>Do you want attribution for your work (Y/N)</li>
        <li className={styles.listItem}>Do you want to allow others to use your work commercially? (Y/N)</li>
        <li className={styles.listItem}>Do you want to allow others to remix, adapt, or build upon your work? (Y/N)</li>
        <li className={styles.listItem}>Confirm that CC licensing is appropriate:</li>
        <ul className={styles.list}>
          <li className={styles.listItem}>I own or have authority to license the work.</li>
          <li className={styles.listItem}>I have read and understand the terms of the license.</li>
          <li className={styles.listItem}>I understand that CC licensing is not revocable.</li>
        </ul>
      </ul>
    </div>
  );
}

export default AboutPage;