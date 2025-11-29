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
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">2T</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                TalkLink
              </span>
            </div>
            <p className="text-sm text-gray-400">Professional digital business cards made simple.</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pricing"><a className="hover:text-orange-400 transition">Pricing</a></Link></li>
              <li><Link href="/templates"><a className="hover:text-orange-400 transition">Templates</a></Link></li>
              <li><Link href="/features"><a className="hover:text-orange-400 transition">Features</a></Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help"><a className="hover:text-orange-400 transition">Help Center</a></Link></li>
              <li><a href="mailto:support@talklink.com" className="hover:text-orange-400 transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-orange-400 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="border-t border-gray-800 pt-8">
          <h4 className="font-semibold text-white mb-6">We Accept 27+ Payment Methods</h4>
          <div className="flex flex-wrap gap-4 justify-start">
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                  <i className={`${method.icon} text-2xl ${method.color}`}></i>
                </div>
                <span className="text-xs text-gray-400 mt-2 text-center max-w-16">{method.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-6">
            + 15 more payment methods including Prompt Pay, Boleto, Pix, SEPA, ACH, Giropay, Sofort, BACS, and regional options
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2025 TalkLink. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 mt-4 md:mt-0">
            Powered by <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">Stripe</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
