import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Phone, Mail, MapPin, Award, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/60 text-on-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-on-surface">
                Roomly<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
              Experience the pinnacle of hospitality. Where contemporary architectural elegance meets
              effortless luxury and five-star bespoke guest care.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-xs font-semibold text-primary">
                <Award className="w-3.5 h-3.5" /> 5-Star Luxury Certified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-xs font-semibold text-secondary">
                <ShieldCheck className="w-3.5 h-3.5" /> Best Hotel Award 2026
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant">
              <li>
                <Link to="/rooms" className="hover:text-primary transition-colors">
                  Our Suites & Villas
                </Link>
              </li>
              <li>
                <Link to="/rooms?tab=amenities" className="hover:text-primary transition-colors">
                  Spa & Wellness
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-primary transition-colors">
                  Dining & Lounge
                </Link>
              </li>
              <li>
                <Link to="/customer/dashboard" className="hover:text-primary transition-colors">
                  Guest Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">
              Direct Contact
            </h4>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>742 Ocean Boulevard, Marina District, CA</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+1 (800) 555-ROOMLY</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>concierge@roomly.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">
              Privilege Club
            </h4>
            <p className="text-xs text-on-surface-variant mb-3">
              Subscribe to unlock private seasonal rates and member-exclusive villa packages.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 rounded-lg text-xs bg-surface-container-lowest border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/95 transition-colors shadow-sm"
              >
                Join Privilege Club
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant gap-4">
          <p>© {new Date().getFullYear()} Roomly Hospitality Group Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
