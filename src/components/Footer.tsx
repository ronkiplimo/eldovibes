
import { Heart, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-red-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                EldoVibes
              </span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Connect with premium companions for unforgettable experiences in Eldoret and beyond. 
              Your trusted platform for professional companion services.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-red-400" />
                <a 
                  href="mailto:eldovibes@gmail.com" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  eldovibes@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-red-400" />
                <a 
                  href="tel:+254716491128" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  0716 491 128
                </a>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="space-y-3">
              <a 
                href="https://www.facebook.com/profile.php?id=61575789377283" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5 text-blue-400" />
                <span>Facebook</span>
              </a>
              <a 
                href="https://www.instagram.com/eldovibes/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5 text-red-400" />
                <span>Instagram</span>
              </a>
              <a 
                href="https://www.tiktok.com/@eldovibes" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
              >
                <div className="h-5 w-5 text-white">🎵</div>
                <span>TikTok</span>
              </a>
              <a 
                href="https://twitter.com/eldovibes" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5 text-blue-400" />
                <span>X (Twitter)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} EldoVibes. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
