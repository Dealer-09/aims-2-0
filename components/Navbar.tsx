import React, { useState } from "react";
import styles from "./Navbar.module.css"; // ✅ Import Navbar styles
import Link from "next/link";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.navbarContainer}>
      <div className={styles.logo}>
        <Link href="/">AIMS</Link>
      </div>

      <ul className={`${styles.navbar} ${menuOpen ? styles.navbarOpen : ""}`}>
        <li><Link href="#home" className={styles.navLink}>Home</Link></li>
        <li><Link href="#about" className={styles.navLink}>About</Link></li>
        <li><Link href="#location" className={styles.navLink}>Location</Link></li>
        <li><Link href="#class" className={styles.navLink}>Class</Link></li>
        <li><Link href="#contact" className={styles.navLink}>Contact</Link></li>
      </ul>

      {/* Mobile Menu Icon */}
      <div className={styles.menuIcon} onClick={() => setMenuOpen(!menuOpen)}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </nav>
  );
};

export default Navbar;

