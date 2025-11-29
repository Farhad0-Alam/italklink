import { Footer } from "@/components/Footer";
import { Link } from "wouter";

export default function CookiePolicy() {
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
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Last Updated: November 29, 2025</p>
          <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. What Are Cookies</h2>
            <p>Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows TalkLink or a third-party to recognize you and make your next visit to the website easier and more useful.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. How TalkLink Uses Cookies</h2>
            <p>When you use and access TalkLink, we may place a number of cookies in your web browser:</p>
            <h3 className="text-lg font-semibold mt-4 mb-2">Types of Cookies We Use:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly, such as for authentication and security</li>
              <li><strong>Performance Cookies:</strong> These cookies analyze how you use the website to improve functionality</li>
              <li><strong>Functional Cookies:</strong> These cookies remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> These cookies track your browsing habits to deliver personalized content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Disabling Cookies</h2>
            <p>You can typically remove or reject cookies via your browser settings. In order to do this, follow the instructions provided by your browser. Some website features may not function properly if you have disabled cookies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Third-Party Cookies</h2>
            <p>In addition to our own cookies, we may also use various third-parties' cookies to report usage statistics of TalkLink, deliver advertisements on and off TalkLink, and so on.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Security</h2>
            <p>The information contained in cookies is encrypted and secured. However, cookies can be deleted or blocked by users, so we cannot guarantee that all cookies will remain active.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Updates to This Policy</h2>
            <p>We may update this Cookie Policy periodically to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you by updating the "Last Updated" date of this Cookie Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Contact Us</h2>
            <p>If you have questions about this Cookie Policy, please contact us at:</p>
            <p className="mt-4">Email: cookies@talklink.com</p>
          </section>
        </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
