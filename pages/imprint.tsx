import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import styles from "./datenschutz.module.css";

// Static, self-contained imprint ("Impressum") per § 5 DDG. Statically
// exported and versioned in code instead of being sourced from Contentful.
// As a predefined route it takes precedence over the optional catch-all
// `[[...slug]].tsx`; the Contentful "imprint" slug is filtered out of that
// route's getStaticPaths to avoid a build-time path conflict.

const ImprintPage: NextPage = () => {
    return (
        <>
            <Head>
                <title>Impressum | loehx.com</title>
                <meta
                    name="description"
                    content="Impressum von loehx.com – Anbieterkennzeichnung gemäß § 5 DDG."
                />
                <meta name="robots" content="index,follow" />
                <meta name="theme-color" content="#000000" />
            </Head>
            <main className={styles.page}>
                <div className={styles.inner}>
                    <a href="/" className={styles.back}>
                        ← zurück zur Startseite
                    </a>

                    <h1 className={styles.title}>Impressum</h1>

                    <h2 className={styles.heading}>
                        Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)
                    </h2>
                    <p className={styles.text}>
                        Alexander Löhn
                        <br />
                        Stahltwiete 18
                        <br />
                        22761 Hamburg
                        <br />
                        Deutschland
                    </p>

                    <h2 className={styles.heading}>Kontakt</h2>
                    <p className={styles.text}>
                        E-Mail:{" "}
                        <a
                            className={styles.link}
                            href="mailto:alexloehn@gmail.com"
                        >
                            alexloehn@gmail.com
                        </a>
                    </p>

                    <h2 className={styles.heading}>Umsatzsteuer-ID</h2>
                    <p className={styles.text}>
                        Umsatzsteuer-Identifikationsnummer gemäß § 27a
                        Umsatzsteuergesetz: DE351595858
                    </p>

                    <h2 className={styles.heading}>
                        Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
                    </h2>
                    <p className={styles.text}>
                        Alexander Löhn
                        <br />
                        Stahltwiete 18
                        <br />
                        22761 Hamburg
                    </p>

                    <h2 className={styles.heading}>
                        Verbraucherstreitbeilegung / Universalschlichtungsstelle
                    </h2>
                    <p className={styles.text}>
                        Wir sind nicht bereit und nicht verpflichtet, an
                        Streitbeilegungsverfahren vor einer
                        Verbraucherschlichtungsstelle teilzunehmen.
                    </p>

                    <h2 className={styles.heading}>Haftung für Inhalte</h2>
                    <p className={styles.text}>
                        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für
                        eigene Inhalte auf diesen Seiten nach den allgemeinen
                        Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir
                        als Diensteanbieter jedoch nicht verpflichtet,
                        übermittelte oder gespeicherte fremde Informationen zu
                        überwachen oder nach Umständen zu forschen, die auf eine
                        rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur
                        Entfernung oder Sperrung der Nutzung von Informationen
                        nach den allgemeinen Gesetzen bleiben hiervon unberührt.
                        Eine diesbezügliche Haftung ist jedoch erst ab dem
                        Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
                        möglich. Bei Bekanntwerden von entsprechenden
                        Rechtsverletzungen werden wir diese Inhalte umgehend
                        entfernen.
                    </p>

                    <h2 className={styles.heading}>Haftung für Links</h2>
                    <p className={styles.text}>
                        Unser Angebot enthält Links zu externen Websites
                        Dritter, auf deren Inhalte wir keinen Einfluss haben.
                        Deshalb können wir für diese fremden Inhalte auch keine
                        Gewähr übernehmen. Für die Inhalte der verlinkten Seiten
                        ist stets der jeweilige Anbieter oder Betreiber der
                        Seiten verantwortlich. Die verlinkten Seiten wurden zum
                        Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
                        überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
                        Verlinkung nicht erkennbar. Eine permanente inhaltliche
                        Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
                        Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
                        Bekanntwerden von Rechtsverletzungen werden wir
                        derartige Links umgehend entfernen.
                    </p>

                    <h2 className={styles.heading}>Urheberrecht</h2>
                    <p className={styles.text}>
                        Die durch den Seitenbetreiber erstellten Inhalte und
                        Werke auf diesen Seiten unterliegen dem deutschen
                        Urheberrecht. Die Vervielfältigung, Bearbeitung,
                        Verbreitung und jede Art der Verwertung außerhalb der
                        Grenzen des Urheberrechtes bedürfen der schriftlichen
                        Zustimmung des jeweiligen Autors bzw. Erstellers.
                        Downloads und Kopien dieser Seite sind nur für den
                        privaten, nicht kommerziellen Gebrauch gestattet. Soweit
                        die Inhalte auf dieser Seite nicht vom Betreiber
                        erstellt wurden, werden die Urheberrechte Dritter
                        beachtet. Solltest du trotzdem auf eine
                        Urheberrechtsverletzung aufmerksam werden, bitten wir um
                        einen entsprechenden Hinweis. Bei Bekanntwerden von
                        Rechtsverletzungen werden wir derartige Inhalte umgehend
                        entfernen.
                    </p>
                </div>
            </main>
        </>
    );
};

export default ImprintPage;
