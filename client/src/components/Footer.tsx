import { CreditCard, Smartphone, Wallet, DollarSign, Zap } from "lucide-react";
import { Link } from "wouter";

export const Footer = () => {
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
          <h4 className="font-semibold text-white mb-4">We Accept Multiple Payment Methods</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Digital Wallets & Cards */}
            <div>
              <h5 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Digital Wallets & Cards</h5>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
                  <CreditCard className="h-4 w-4 text-orange-400" />
                  <span className="text-sm">Visa, Mastercard, Amex</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
                  <Smartphone className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">Apple Pay, Google Pay</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
                  <Wallet className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">PayPal</span>
                </div>
              </div>
            </div>

            {/* Regional & BNPL */}
            <div>
              <h5 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Regional & BNPL</h5>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
                  <span className="text-sm">Alipay, WeChat Pay</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">Klarna, Affirm</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Bank Transfers</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            + 12 more payment methods including Boleto, iDEAL, Giropay, SEPA, ACH, and more regional options
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
