import { Link } from "wouter";

export const Footer = () => {
  const paymentMethods = [
    { name: "Visa", icon: "fab fa-cc-visa", color: "text-blue-600" },
    { name: "Mastercard", icon: "fab fa-cc-mastercard", color: "text-red-600" },
    { name: "American Express", icon: "fab fa-cc-amex", color: "text-blue-500" },
    { name: "PayPal", icon: "fab fa-paypal", color: "text-blue-700" },
    { name: "Apple Pay", icon: "fab fa-apple", color: "text-gray-900" },
    { name: "Google Pay", icon: "fab fa-google", color: "text-blue-600" },
    { name: "Alipay", icon: "fab fa-alipay", color: "text-blue-700" },
    { name: "WeChat Pay", icon: "fab fa-weixin", color: "text-green-600" },
    { name: "Klarna", icon: "fas fa-wallet", color: "text-pink-600" },
    { name: "Affirm", icon: "fas fa-credit-card", color: "text-blue-600" },
    { name: "Bank Transfer", icon: "fas fa-university", color: "text-gray-700" },
    { name: "iDEAL", icon: "fas fa-building", color: "text-red-600" },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-200 dark:text-gray-300 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg hover:shadow-green-500/30 transition-shadow">
                <svg viewBox="0 0 1000 1000" className="w-10 h-10">
                  <path fill="#22c55e" d="M817.9,999.9H182.1C81.8,999.9-0.2,917.8-0.2,817.5v-635C-0.2,82.2,81.8,0.1,182.1,0.1h635.7c100.3,0,182.4,82.1,182.4,182.4v635C1000.2,917.8,918.2,999.9,817.9,999.9z"/>
                  <path fill="none" stroke="#FFFFFF" strokeWidth="70" strokeMiterlimit="10" d="M315,857c-116.4-65.3-195-189.8-195-332.7C120,313.7,290.7,143,501.3,143c210.6,0,381.2,170.7,381.2,381.2c0,82.3-26.7,166.9-77.1,232.3c-47.2,61.2-124.5,112.4-204.8,97.6c-27.8-5.1-55-17.9-74.7-38.6c-17.8-18.8-26.3-42.5-27.2-68V437"/>
                  <ellipse cx="498.5" cy="357.5" rx="44.5" ry="44.5" fill="#FFFFFF"/>
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
                iTalkLink
              </span>
            </div>
            <p className="text-sm text-gray-400">Professional digital business cards made simple.</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pricing"><a className="hover:text-green-400 transition">Pricing</a></Link></li>
              <li><Link href="/templates"><a className="hover:text-green-400 transition">Templates</a></Link></li>
              <li><Link href="/features"><a className="hover:text-green-400 transition">Features</a></Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help"><a className="hover:text-green-400 transition">Help Center</a></Link></li>
              <li><a href="mailto:support@italklink.com" className="hover:text-green-400 transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms-of-service"><a className="hover:text-green-400 transition">Terms of Service</a></Link></li>
              <li><Link href="/privacy-policy"><a className="hover:text-green-400 transition">Privacy Policy</a></Link></li>
              <li><Link href="/cookie-policy"><a className="hover:text-green-400 transition">Cookie Policy</a></Link></li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="border-t border-gray-800 pt-8">
          <h4 className="font-semibold text-white mb-8">We Accept 27+ Payment Methods</h4>
          <div className="flex flex-wrap gap-6 justify-start">
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <i className={`${method.icon} text-4xl ${method.color}`}></i>
                </div>
                <span className="text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-600 px-3 py-1.5 rounded-lg mt-3 text-center w-fit">{method.name}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-8 font-medium">
            + 15 more payment methods including Prompt Pay, Boleto, Pix, SEPA, ACH, Giropay, Sofort, BACS, and regional options
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2025 iTalkLink. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 mt-4 md:mt-0">
            Powered by <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">Stripe</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
