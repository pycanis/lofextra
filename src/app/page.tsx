"use client";

import Link from "next/link";
import styles from "./styles.module.css";
import { Translation } from "./translations/Translation";
import { LocationSwitcher } from "./translations/LocationSwitcher";

export default function Page() {
  return (
    <main className={styles.main}>
      <h1>lofextra (beta)</h1>
      <LocationSwitcher />
      <h3>
        <Translation id="LOCAL_FIRST_EXPENSE_TRACKER" />
      </h3>
      <Link href="/dashboard">
        <button>
          <Translation id="TO_APP" />
        </button>
      </Link>
      <ul>
        <li>retain full ownership of your data securely and privately</li>
        <li>real-time e2e encrypted updates between multiple devices</li>
        <li>use mnemonic phrase as key to your account</li>
        <li>no registration, no email, no password</li>
        <li>install the app to get the native app feel</li>
        <li>works offline</li>
      </ul>
    </main>
  );
}
