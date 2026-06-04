import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import styles from "./datenschutz.module.css";

// Static, self-contained privacy policy ("Datenschutzerklärung"). It is
// intentionally NOT sourced from Contentful so it can be versioned in code and
// ships as a plain static page via `next export`. As a predefined route it
// takes precedence over the optional catch-all `[[...slug]].tsx`.
//
// NOTE for the site owner: the controller's postal address is legally required
// (Art. 13 GDPR / § 5 DDG). Replace the marked placeholder below with the real
// address before relying on this page.

const DatenschutzPage: NextPage = () => {
    return (
        <>
            <Head>
                <title>Datenschutzerklärung | loehx.com</title>
                <meta
                    name="description"
                    content="Datenschutzerklärung von loehx.com – Informationen zur Verarbeitung personenbezogener Daten, insbesondere im KI-Chat."
                />
                <meta name="robots" content="index,follow" />
                <meta name="theme-color" content="#000000" />
            </Head>
            <main className={styles.page}>
                <div className={styles.inner}>
                    <a href="/" className={styles.back}>
                        ← zurück zur Startseite
                    </a>

                    <h1 className={styles.title}>Datenschutzerklärung</h1>
                    <p className={styles.updated}>Stand: Juni 2026</p>

                    <p className={styles.text}>
                        Mit dieser Datenschutzerklärung informieren wir Sie über
                        die Verarbeitung personenbezogener Daten beim Besuch
                        dieser Website und insbesondere bei der Nutzung des
                        KI-Chats („Talk to my AI Agent“). Die Verarbeitung
                        erfolgt im Einklang mit der Datenschutz-Grundverordnung
                        (DSGVO) und dem Bundesdatenschutzgesetz (BDSG).
                    </p>

                    <h2 className={styles.heading}>1. Verantwortlicher</h2>
                    <p className={styles.text}>
                        Verantwortlich für die Datenverarbeitung im Sinne von
                        Art. 4 Nr. 7 DSGVO ist:
                    </p>
                    <p className={styles.text}>
                        Alexander Löhn
                        <br />
                        Stahltwiete 18
                        <br />
                        22761 Hamburg
                        <br />
                        E-Mail:{" "}
                        <a
                            className={styles.link}
                            href="mailto:alexloehn@gmail.com"
                        >
                            alexloehn@gmail.com
                        </a>
                    </p>

                    <h2 className={styles.heading}>
                        2. KI-Chat („Talk to my AI Agent“)
                    </h2>
                    <p className={styles.text}>
                        Diese Website bietet optional einen KI-gestützten Chat
                        an, mit dem Sie Fragen über Alexander Löhn stellen
                        können. Wenn Sie den Chat aktiv nutzen und eine
                        Nachricht absenden, werden die folgenden Daten
                        verarbeitet.
                    </p>

                    <h3 className={styles.subheading}>
                        Welche Daten werden verarbeitet?
                    </h3>
                    <ul className={styles.list}>
                        <li>
                            der Inhalt Ihrer eingegebenen Nachricht (Ihre Frage
                            bzw. der von Ihnen eingegebene Text),
                        </li>
                        <li>die vom KI-Agenten generierte Antwort,</li>
                        <li>
                            eine technische Sitzungs-Kennung (Agent-/Session-ID)
                            zur Zuordnung des Gesprächsverlaufs,
                        </li>
                        <li>
                            die Spracheinstellung Ihres Browsers
                            (Browser-Locale, z. B. „de-DE“),
                        </li>
                        <li>
                            sowie technisch zwingend übertragene
                            Verbindungsdaten (insbesondere Ihre IP-Adresse), die
                            von den beteiligten Dienstleistern zur Auslieferung
                            verarbeitet werden.
                        </li>
                    </ul>
                    <p className={styles.text}>
                        Sofern Sie in Ihrer Nachricht freiwillig
                        personenbezogene Daten (z. B. Ihren Namen oder Ihre
                        Kontaktdaten) eingeben, werden auch diese verarbeitet.
                    </p>

                    <span className={styles.note}>
                        Bitte geben Sie im Chat keine sensiblen
                        personenbezogenen Daten im Sinne von Art. 9 DSGVO (z. B.
                        Gesundheits-, Religions- oder andere besonders
                        schützenswerte Daten) und keine vertraulichen
                        Informationen Dritter ein.
                    </span>

                    <h3 className={styles.subheading}>
                        Zwecke der Verarbeitung
                    </h3>
                    <ul className={styles.list}>
                        <li>
                            Generierung einer Antwort auf Ihre Anfrage durch den
                            KI-Agenten,
                        </li>
                        <li>
                            Qualitätssicherung, Nachvollziehbarkeit und
                            Verbesserung des Chat-Angebots. Zu diesem Zweck wird
                            jeder Gesprächsverlauf (Ihre Nachricht, die Antwort,
                            die Sitzungs-ID und das Browser-Locale) per E-Mail
                            an den Betreiber übermittelt.
                        </li>
                    </ul>

                    <h3 className={styles.subheading}>Rechtsgrundlage</h3>
                    <p className={styles.text}>
                        Rechtsgrundlage ist Ihre Einwilligung, die Sie durch das
                        bewusste Absenden einer Nachricht im Chat erteilen (Art.
                        6 Abs. 1 lit. a DSGVO). Daneben besteht ein berechtigtes
                        Interesse des Betreibers am sicheren, funktionsfähigen
                        Betrieb sowie an der Qualitätssicherung des Angebots
                        (Art. 6 Abs. 1 lit. f DSGVO). Sie sind nicht
                        verpflichtet, den Chat zu nutzen; die übrige Website ist
                        ohne den Chat vollständig nutzbar.
                    </p>

                    <h3 className={styles.subheading}>
                        Empfänger und Übermittlung in Drittländer
                    </h3>
                    <p className={styles.text}>
                        Zur Bereitstellung des Chats werden Daten an die
                        folgenden Dienstleister übermittelt, die teils in den
                        USA ansässig sind. Soweit Daten in die USA oder andere
                        Drittländer übermittelt werden, erfolgt dies auf
                        Grundlage von Standardvertragsklauseln der EU-Kommission
                        (Art. 46 DSGVO) und/oder einer Zertifizierung nach dem
                        EU-US Data Privacy Framework (Art. 45 DSGVO):
                    </p>
                    <ul className={styles.list}>
                        <li>
                            <strong>Anysphere Inc. („Cursor“), USA</strong> –
                            Die Inhalte Ihrer Nachrichten werden an die Cursor
                            Cloud Agents API übermittelt, um die KI-Antwort zu
                            generieren.
                        </li>
                        <li>
                            <strong>Resend (Plus Five Five, Inc.), USA</strong>{" "}
                            – E-Mail-Dienst, über den der Gesprächsverlauf zur
                            Qualitätssicherung an den Betreiber versendet wird.
                        </li>
                        <li>
                            <strong>
                                Google Ireland Ltd. / Google LLC (Gmail)
                            </strong>{" "}
                            – Das Postfach, in dem die zur Qualitätssicherung
                            versandten Gesprächsverläufe eingehen und
                            gespeichert werden.
                        </li>
                        <li>
                            <strong>Netlify, Inc., USA</strong> – Hosting der
                            Website und Betrieb der Server-Funktionen, über die
                            die Anfragen verarbeitet werden.
                        </li>
                    </ul>

                    <h2 className={styles.heading}>
                        3. Hosting und Server-Log-Dateien
                    </h2>
                    <p className={styles.text}>
                        Die Website wird bei Netlify gehostet. Beim Aufruf der
                        Seite verarbeitet der Hosting-Anbieter technisch
                        notwendige Verbindungsdaten (u. a. IP-Adresse, Zeitpunkt
                        des Zugriffs, abgerufene Ressource, Browsertyp).
                        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das
                        berechtigte Interesse liegt in der sicheren und stabilen
                        Bereitstellung der Website.
                    </p>

                    <h2 className={styles.heading}>
                        4. Lokale Speicherung im Browser
                    </h2>
                    <p className={styles.text}>
                        Für den Betrieb des KI-Chats wird die Sitzungs-Kennung
                        im <em>sessionStorage</em> Ihres Browsers gespeichert,
                        um einen Gesprächsverlauf innerhalb einer Sitzung
                        zuordnen zu können. Diese Daten werden spätestens beim
                        Schließen des Browser-Tabs automatisch gelöscht und
                        nicht an Dritte weitergegeben. Rechtsgrundlage ist § 25
                        Abs. 2 TDDDG (technisch erforderliche Speicherung) i. V.
                        m. Art. 6 Abs. 1 lit. f DSGVO.
                    </p>

                    <h2 className={styles.heading}>5. Speicherdauer</h2>
                    <p className={styles.text}>
                        Die per E-Mail übermittelten Gesprächsverläufe werden im
                        Postfach des Betreibers gespeichert und gelöscht, sobald
                        sie für die genannten Zwecke nicht mehr erforderlich
                        sind. Server-Log-Daten werden nach den Vorgaben des
                        Hosting-Anbieters für einen begrenzten Zeitraum
                        gespeichert. Daten, die wir aufgrund gesetzlicher
                        Aufbewahrungspflichten vorhalten müssen, werden bis zum
                        Ablauf der jeweiligen Frist gespeichert.
                    </p>

                    <h2 className={styles.heading}>6. Ihre Rechte</h2>
                    <p className={styles.text}>
                        Sie haben im Rahmen der gesetzlichen Voraussetzungen die
                        folgenden Rechte:
                    </p>
                    <ul className={styles.list}>
                        <li>Auskunft (Art. 15 DSGVO),</li>
                        <li>Berichtigung (Art. 16 DSGVO),</li>
                        <li>Löschung (Art. 17 DSGVO),</li>
                        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
                        <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
                        <li>
                            Widerspruch gegen die Verarbeitung (Art. 21 DSGVO).
                        </li>
                    </ul>
                    <p className={styles.text}>
                        Eine erteilte Einwilligung können Sie jederzeit mit
                        Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3
                        DSGVO). Die Rechtmäßigkeit der bis zum Widerruf
                        erfolgten Verarbeitung bleibt davon unberührt. Zur
                        Ausübung Ihrer Rechte genügt eine formlose Nachricht an
                        die oben genannten Kontaktdaten.
                    </p>

                    <h2 className={styles.heading}>
                        7. Beschwerderecht bei der Aufsichtsbehörde
                    </h2>
                    <p className={styles.text}>
                        Sie haben das Recht, sich bei einer
                        Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer
                        personenbezogenen Daten zu beschweren (Art. 77 DSGVO),
                        insbesondere bei der Aufsichtsbehörde Ihres gewöhnlichen
                        Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des
                        mutmaßlichen Verstoßes.
                    </p>

                    <h2 className={styles.heading}>
                        8. Änderungen dieser Datenschutzerklärung
                    </h2>
                    <p className={styles.text}>
                        Wir passen diese Datenschutzerklärung an, sobald
                        Änderungen der Datenverarbeitung oder der rechtlichen
                        Rahmenbedingungen dies erforderlich machen. Es gilt
                        jeweils die auf dieser Seite veröffentlichte aktuelle
                        Fassung.
                    </p>
                </div>
            </main>
        </>
    );
};

export default DatenschutzPage;
