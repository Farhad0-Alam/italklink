import { Footer } from "@/components/Footer";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center space-x-2 hover:opacity-80 transition">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">2T</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">TalkLink</span>
            </a>
          </Link>
          <nav className="flex gap-6">
            <Link href="/"><a className="hover:text-orange-500 transition">Home</a></Link>
            <Link href="/pricing"><a className="hover:text-orange-500 transition">Pricing</a></Link>
            <Link href="/login"><a className="hover:text-orange-500 transition">Login</a></Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Last Updated: November 29, 2025</p>
          <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
            <p>TalkLink ("we", "our", or "us") operates the TalkLink website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our service to you.</p>
            <h3 className="text-lg font-semibold mt-4 mb-2">Types of Data Collected:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Personal Data:</strong> Email address, first name, last name, phone number, address, cookies and usage data</li>
              <li><strong>Usage Data:</strong> Browser type, browser version, pages visited, time and date of your visit, time spent on pages</li>
              <li><strong>Payment Data:</strong> Processed securely through Stripe; we do not store full credit card information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Use of Data</h2>
            <p>TalkLink uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Security of Data</h2>
            <p>The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Service Providers</h2>
            <p>We may employ third party companies and individuals to facilitate our service ("Service Providers"), to provide the service on our behalf, to perform service-related services, or to assist us in analyzing how our service is used.</p>
            <p className="mt-4">These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Links to Other Sites</h2>
            <p>Our service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-4">Email: privacy@talklink.com</p>
          </section>
        </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
