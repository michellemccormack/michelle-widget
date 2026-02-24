/**
 * AI Campaign Assistant demo - matches public/demo.html, widget is in layout.
 * Responsive: mobile-first with 640px breakpoint.
 */

import { Tilt_Warp, Bitter } from 'next/font/google';
import styles from './page.module.css';

const tiltWarp = Tilt_Warp({ subsets: ['latin'] });
const bitter = Bitter({ subsets: ['latin'] });

export default function DemoPage() {
  return (
    <main
      className={styles.main}
      style={{ fontFamily: bitter.style.fontFamily }}
    >
      <div className={styles.container}>
        <h1
          className={`${tiltWarp.className} ${styles.heading}`}
        >
          Promptly AI
        </h1>

        <p className={styles.intro}>
          People often get lost on websites looking for answers.
          <br />
          Promptly fixes that.
        </p>

        <h2 className={styles.subheading}>
          What it does:
        </h2>
        <ul className={styles.list}>
          {[
            'Responds with natural language, 24/7',
            'Matches your voice and brand',
            'Captures emails, donations, and leads',
          ].map((item) => (
            <li key={item} className={styles.listItem}>
              {item}
            </li>
          ))}
        </ul>

        <div className={styles.instructionBox}>
          <p className={styles.instructionP}>
            <strong>Try it now:</strong> Click the bubble in the corner. Ask about my work, services, or how Promptly works.
          </p>
          <p className={styles.instructionP}>
            Notice how it responds naturally, handles any question, and captures contact info at exactly the right moment? That&apos;s fully automated and I can build it for you in days.
          </p>
        </div>
      </div>

      <footer className={styles.footer} style={{ fontFamily: bitter.style.fontFamily }}>
        Built by{' '}
        <a href="https://www.michellemccormack.com/" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
          Michelle McCormack
        </a>
      </footer>
    </main>
  );
}
