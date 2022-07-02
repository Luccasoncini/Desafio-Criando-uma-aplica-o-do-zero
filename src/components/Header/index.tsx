import styles from './header.module.scss'
import Link from 'next/link'

export default function Header() {
  return(
    <header className={styles.header_container}>
      <Link href="/">
        <a>
          <img src="/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
