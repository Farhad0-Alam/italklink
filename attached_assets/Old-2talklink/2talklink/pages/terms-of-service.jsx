import React, { useState, useEffect, useRef } from "react";
import { FaChevronUp } from "react-icons/fa";
import styles from "../styles/pages/LandingPage.module.css";
import Link from "next/link";
import Cookies from "js-cookie";
import { common } from "../src/helper/Common";
import FooterBottom from "../src/components/landing/_components/FooterBottom";
import Header from "../src/components/landing/_components/Header";
export default function TermsOfService() {
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
    <div className="ecardURLTermsOfServiceContainer">
      <Header customBackground={"#3498db"} />
      <header className="ecardURLTermsOfServiceHeader">
        <h1>Terms of Service</h1>
        <p className="ecardURLTermsOfServiceEffectiveDate">
          Effective Date: 01-01-2025
        </p>
      </header>
      <main className="ecardURLTermsOfServiceMain">
        <section className="ecardURLTermsOfServiceSection">
          <p>
            Welcome to 2TalkLink! These Terms of Service ("Terms") govern your
            access to and use of our website and services, including creating
            and managing digital business cards. By accessing or using
            2TalkLink, you agree to these Terms. If you do not agree, please
            refrain from using our services.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By creating an account or using our services, you acknowledge that
            you have read, understood, and agree to abide by these Terms. If you
            are using 2TalkLink on behalf of a company or organization, you
            affirm that you have the authority to accept these Terms on behalf
            of that entity.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>2. Description of Services</h2>
          <p>
            2TalkLink provides a platform where users can create, customize, and
            share digital business cards ("Services"). You can add personal
            information, social media links, and other relevant details to your
            cards and share them using a unique URL or QR code.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>3. User Account Responsibilities</h2>
          <p>
            To use certain features, you must create an account. When creating
            an account, you agree to:
          </p>
          <ul className="ecardURLTermsOfServiceList">
            <li>Provide accurate, complete, and current information.</li>
            <li>Keep your login credentials secure and confidential.</li>
            <li>
              Notify us immediately if you suspect any unauthorized use of your
              account.
            </li>
            <li>
              Accept responsibility for all activities under your account.
            </li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts if these Terms
            are violated.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>4. Acceptable Use</h2>
          <p>You agree to use 2TalkLink services responsibly and not to:</p>
          <ul className="ecardURLTermsOfServiceList">
            <li>Misrepresent yourself or impersonate others.</li>
            <li>Upload content that is unlawful, defamatory, or offensive.</li>
            <li>
              Engage in any activity that could disrupt, damage, or negatively
              impact our platform.
            </li>
            <li>
              Attempt to access or manipulate accounts or data without
              permission.
            </li>
            <li>
              Use automated means to access, collect, or interact with the
              service.
            </li>
          </ul>
          <p>
            We reserve the right to investigate and take action against any
            violation, including terminating accounts and reporting illegal
            activity to authorities.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>5. User Content and License</h2>
          <p>
            By creating a digital business card, you grant 2TalkLink a limited,
            non-exclusive, royalty-free license to host, display, and distribute
            your content solely to operate the platform. You retain all rights
            to your content, and this license will terminate when you delete
            your account.
          </p>
          <p>
            You are solely responsible for the accuracy, legality, and
            appropriateness of the information you upload to your card.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2> 6. Privacy, Data Use, and Security</h2>
          <p>
            2TalkLink is committed to ensuring the security and privacy of your
            personal information. We use industry-standard encryption and
            security protocols to protect your data during transmission and
            storage. All sensitive data, including payment information, is
            handled securely through our third-party payment processor, Stripe,
            which complies with the Payment Card Industry Data Security Standard
            (PCI DSS). This ensures that your card details are stored and
            processed in a secure manner, meeting the highest industry standards
            for payment processing. We will never store your full payment card
            details on our servers. All payments are processed through Stripe,
            which is fully PCI compliant. For more details about how Stripe
            handles payment security, please refer to their PCI Compliance
            Information.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>7. Payment and Billing</h2>
          <p>
            By subscribing to 2TalkLink, you agree to pay the fees for the
            services selected at the time of purchase. Payments are processed
            through Stripe, and the billing cycle is determined based on the
            subscription plan you choose. You will be charged at the time of
            checkout. We accept payment via credit and debit cards. All charges
            are billed in advance, and you authorize us to process recurring
            payments on a regular basis, according to the subscription plan you
            selected.
          </p>
          <h3>Refund Policy</h3>
          <p>
            We want you to be completely satisfied with your experience on
            2TalkLink. If, for any reason, you are not happy with our service,
            we offer a 30-day satisfaction guarantee. You may request a refund
            within 30 days of your purchase. To request a refund, please contact
            our support team at contact@2talklink.com with your order details.
            Refunds will be issued to the original payment method and processed
            within 7-10 business days. Please note that after 50 days, we are
            unable to provide refunds.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>8. Intellectual Property Rights</h2>
          <p>
            2TalkLink and its content (e.g., text, graphics, logos, and
            software) are the property of 2TalkLink or its licensors and are
            protected by copyright, trademark, and other intellectual property
            laws. You may not use, reproduce, or distribute any content from
            2TalkLink without our express written consent.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>9. Termination and Suspension</h2>
          <p>
            We reserve the right to suspend or terminate your account and access
            to the Services if you violate these Terms, fail to pay fees when
            due, or engage in activities harmful to 2TalkLink or other users.
          </p>
          <p>
            Upon termination, you will lose access to your account, and we may
            delete all associated data, except as required by law.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>10. Disclaimer of Warranties</h2>
          <p>
            2TalkLink is provided on an "as-is" and "as-available" basis. We
            make no warranties, express or implied, regarding the reliability,
            availability, or suitability of the platform for your purposes.
            Specifically, we do not guarantee that:
          </p>
          <ul className="ecardURLTermsOfServiceList">
            <li>The service will be error-free, uninterrupted, or secure.</li>
            <li>Content provided will be accurate or reliable.</li>
            <li>Defects will be corrected promptly.</li>
          </ul>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>11. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, 2TalkLink, its affiliates,
            and employees will not be liable for any indirect, incidental,
            special, or consequential damages arising from or in connection
            with:
          </p>
          <ul className="ecardURLTermsOfServiceList">
            <li>Your use of or inability to use the service.</li>
            <li>Unauthorized access, misuse, or alteration of your content.</li>
            <li>Loss of profits, data, or business opportunity.</li>
          </ul>
          <p>
            In jurisdictions where limitations on liability are restricted, our
            liability will be limited to the amount you paid us for services
            during the six months before the claim arose.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>12. Indemnification</h2>
          <p>
            You agree to indemnify and hold 2TalkLink, its affiliates, and
            employees harmless from any claims, damages, losses, or expenses
            (including legal fees) arising from:
          </p>
          <ul className="ecardURLTermsOfServiceList">
            <li>Your use of the Services.</li>
            <li>Content you submit to 2TalkLink.</li>
            <li>Your violation of these Terms or any applicable laws.</li>
          </ul>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>13. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of the State of California,
            USA, without regard to conflict of law principles. In the event of
            any dispute arising from or relating to these Terms, you agree to
            first contact us to seek a resolution informally. If we cannot
            resolve the dispute informally, it will be resolved through binding
            arbitration under the rules of the American Arbitration Association.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>14. Changes to Terms of Service</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will
            notify you of significant changes by posting an updated version here
            and updating the effective date. Your continued use of the platform
            after such changes indicates acceptance of the new Terms.
          </p>
        </section>

        <section className="ecardURLTermsOfServiceSection">
          <h2>15. Contact Information</h2>
          <p>If you have questions about these Terms, please contact us:</p>
          <p>
            <strong>Email:</strong> contact@2talklink.com
          </p>
          <address className="ecardURLTermsOfServiceAddress">
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
          className="ecardURLTermsOfServiceScrollTop"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <FaChevronUp />
        </button>
      )}
    </div>
  );
}
