import React, { useState, useEffect, useRef } from "react";
import { FaChevronUp } from "react-icons/fa";
import styles from "../styles/pages/LandingPage.module.css";
import Link from "next/link";
import FooterBottom from "../src/components/landing/_components/FooterBottom";
import Header from "../src/components/landing/_components/Header";
export default function privacyAndPolicy() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="ecardURLPrivacyPolicy">
      <Header customBackground="#3498db" />
      <header className="ecardURLHeader">
        <h1>Privacy Policy</h1>
        <p className="ecardURLEffectiveDate">Effective Date: 01-01-2025</p>
      </header>
      <main className="ecardURLMain">
        <section className="ecardURLSection">
          <h2>Introduction</h2>
          <p>
            Welcome to 2TalkLink! We are committed to protecting your privacy
            and providing a secure platform for creating and managing digital
            business cards. This Privacy Policy explains how we handle your data
            and outlines your rights and options regarding your information.
          </p>
        </section>

        <section className="ecardURLSection">
          <h2>1. Scope of This Privacy Policy</h2>
          <p>
            This Privacy Policy applies to all users of 2TalkLink and governs
            the collection, processing, and storage of personal information
            obtained through our website and services. By using 2TalkLink, you
            consent to the collection, use, and processing of your personal
            information as outlined in this Privacy Policy. As 2TalkLink
            provides services worldwide, we comply with applicable data
            protection laws, including but not limited to the General Data
            Protection Regulation (GDPR) for European Union users, the
            California Consumer Privacy Act (CCPA) for California residents, and
            other relevant privacy laws. This policy explains how we handle your
            data and outlines your rights regarding your personal information.
          </p>
        </section>

        <section className="ecardURLSection">
          <h2>2. Information We Collect</h2>
          <p>
            We collect the following types of personal information to provide
            and improve our services: Account and Profile Information: When you
            register for an account, we collect information such as your name,
            email address, company name, job title, phone number, and any other
            details necessary to create your digital business card and customize
            your user experience. Usage Data: We collect data about how you
            interact with our services, including login details, device
            information, browser type, and usage statistics. This helps us
            improve our services, detect errors, and enhance the user
            experience. Payment Information: When you make a purchase or
            subscribe to our service, payment information such as credit card
            details are processed securely through Stripe, our third-party
            payment processor. We do not store payment information on our
            servers. Cookies and Tracking Technologies: We use cookies and
            similar technologies to improve your experience and analyze site
            performance. You can manage your cookie preferences through your
            browser settings.
          </p>
        </section>

        <section className="ecardURLSection">
          <h2>3. How We Use Your Information</h2>
          <p>We use your personal information for the following purposes: </p>
          <ul className="ecardURLList">
            <li>
              <strong>To Provide and Manage Services:</strong> Your data helps
              us deliver and manage your digital business card, customize your
              experience, and provide support for our services.
            </li>
            <li>
              <strong>Personalization and User Experience:</strong> We use your
              data to personalize your experience on 2TalkLink, offering
              relevant features and improving our platform.
            </li>
            <li>
              <strong>Customer Support and Communication:</strong> Your contact
              information is used to respond to inquiries, provide support, and
              send important updates regarding your account and services.
            </li>
            <li>
              <strong>Data Security and Compliance:</strong> We process your
              data in compliance with applicable laws, including the GDPR, to
              protect your privacy and secure your personal information.
            </li>
          </ul>
        </section>

        <section className="ecardURLSection">
          <h2>4. User Control and Data Management</h2>
          <p>
            2TalkLink provides you with full control over your personal data.
            You can manage and update your information, as well as control your
            privacy settings, through your account settings at any time.
          </p>
          <ul className="ecardURLList">
            <li>
              <strong>Access to Data:</strong> You can request a copy of your
              personal information stored with us. We will provide you with the
              data we hold about you within the time frame required by law.
            </li>
            <li>
              <strong>Data Deletion:</strong> You can delete your account at any
              time, which will remove all associated personal data from our
              platform. However, we may retain certain information for legal
              compliance, business records, or security purposes.
            </li>
            <li>
              <strong>Account Updates:</strong> You can update or modify your
              personal information directly through your account settings. If
              you need assistance, please contact our support team.
            </li>
          </ul>
        </section>

        <section className="ecardURLSection">
          <h2>5. Data Sharing and Disclosure</h2>
          <p>
            Your privacy is important to us, and we do not sell or share your
            personal information except under these circumstances:
          </p>
          <ul className="ecardURLList">
            <li>
              <strong>With Your Consent:</strong> You control the visibility of
              your digital business card and can share it via URL or QR code as
              you choose.
            </li>
            <li>
              <strong>Service Providers:</strong> We work with trusted
              third-party service providers to operate our website, conduct
              analytics, and secure our platform. These providers may have
              limited access to your data to perform their tasks but are
              contractually bound to protect it.
            </li>
            <li>
              <strong>Legal Obligations:</strong> We may disclose information if
              required to comply with legal requests, enforce our policies, or
              protect 2TalkLink's rights, users, and safety.
            </li>
          </ul>
        </section>

        <section className="ecardURLSection">
          <h2>6. Data Security and Protection Measures</h2>
          <p>
            We implement a range of security measures to safeguard your data,
            including encryption, firewalls, and secure data storage protocols.
            However, please note that no method of online storage or
            transmission is entirely secure. We recommend using a strong
            password and securing your account credentials.
          </p>
        </section>

        <section className="ecardURLSection">
          <h2>7. Data Retention Policy</h2>
          <p>
            Your data is retained only as long as necessary to fulfill the
            purposes for which it was collected. You can delete your information
            at any time through your account settings. Upon account deletion, we
            erase all related information except data required for compliance,
            legal obligations, or essential business records.
          </p>
        </section>

        <section className="ecardURLSection">
          <h2>8. International Data Transfers</h2>
          <p>
            2TalkLink operates in various regions and may transfer your
            information outside your country of residence, including to the
            United States, for processing and storage. When transferring data
            internationally, we follow applicable data protection regulations
            and employ safeguards such as Standard Contractual Clauses where
            required.
          </p>
        </section>

        <section className="ecardURLSection">
          <h2>9. Your Rights and Choices</h2>
          <p>
            Depending on your location, you may have certain rights over your
            personal data, including:
          </p>
          <ul className="ecardURLList">
            <li>
              <strong>Access:</strong> Request a copy of the personal data we
              hold about you.
            </li>
            <li>
              <strong>Correction:</strong> Correct inaccuracies in your profile
              information.
            </li>
            <li>
              <strong>Deletion:</strong> Delete your account and associated data
              through your account settings.
            </li>
            <li>
              <strong>Portability:</strong> Request your data in a
              machine-readable format.
            </li>
            <li>
              <strong>Opt-Out of Marketing:</strong> You may unsubscribe from
              promotional emails at any time by following the opt-out
              instructions in the message.
            </li>
          </ul>
          <p>
            To exercise these rights, please contact us at
            contact@2talklink.com. We will respond to your request within a
            reasonable timeframe and in compliance with applicable laws.
          </p>
        </section>

        <section className="ecardURLSection">
          <h2>10. Cookies and Similar Technologies</h2>
          <p>
            Our site uses cookies and similar tracking technologies to improve
            user experience and analyze site performance. Cookies enable us to
            remember your preferences and customize content. You can manage your
            cookie preferences through your browser settings, though some
            features may not function properly if cookies are disabled.
          </p>
        </section>

        <section className="ecardURLSection">
          <h2>11. Third-Party Links</h2>
          <p>
            2TalkLink may contain links to external websites or services not
            operated by us. We are not responsible for their privacy practices,
            and we encourage you to review the privacy policies of any
            third-party sites you visit.
          </p>
        </section>

        <section className="ecardURLSection">
          <h2>12. Children's Privacy</h2>
          <p>
            2TalkLink is not intended for children under the age of 13, and we
            do not knowingly collect data from children under 13. If we discover
            that we have collected such information, we will promptly delete it.
            Parents who believe we may have unintentionally collected
            information from their child should contact us.
          </p>
        </section>

        <section className="ecardURLSection">
          <h2>13. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or legal requirements. We will notify you
            of significant changes and update the effective date. Continued use
            of our services after such updates constitutes your acceptance of
            the revised Privacy Policy.
          </p>
        </section>

        <section className="ecardURLSection">
          <h2>14. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or
            how we handle your data, please contact us:
          </p>
          <p>
            <strong>Email:</strong> contact@2talklink.com
          </p>
          <address className="ecardURLAddress">
            MD FARHAD ALAM
            <br />
            30 N Gould St Ste R<br />
            Sheridan WY 82801
            <br />
            USA
          </address>
        </section>
      </main>
      <FooterBottom />
      {showScrollTop && (
        <button
          className="ecardURLScrollTop"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <FaChevronUp />
        </button>
      )}
    </div>
  );
}
