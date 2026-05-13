'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';

// ShinyText Component with animated gradient
const ShinyText = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="relative inline-block">
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent bg-clip-text text-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(100deg, #64CEFB 0%, #ffffff 50%, #64CEFB 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
        }}
      />
      <span className="relative bg-gradient-to-r from-[#64CEFB] via-white to-[#64CEFB] bg-clip-text text-transparent">
        {children}
      </span>
    </span>
  );
};

export default function DesignProDemo() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = ['Home', 'About Us', 'Courses', 'Instructors', 'Testimonials', 'Blog', 'Contact us'];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black font-sans">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
              <span className="text-white font-medium">DesignPro</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-700">
                {navLinks.map((link, i) => (
                  <a
                    key={i}
                    href="#"
                    className={`px-3 py-1.5 text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1 ${
                      link === 'Contact us' ? 'flex items-center gap-1' : ''
                    }`}
                  >
                    {link}
                    {link === 'Contact us' && <ArrowRight className="w-3 h-3" />}
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-black/90 border-t border-white/10">
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((link, i) => (
                <a
                  key={i}
                  href="#"
                  className="block px-4 py-2 text-sm text-white/80 hover:text-white rounded-lg hover:bg-white/10"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 h-[calc(100vh-64px)] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          {/* Top Section - Two Columns */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
            <p className="text-white/80 text-sm md:text-base">
              We deliver transformative programs that empower emerging product designers with cutting-edge expertise and vision to thrive globally.
            </p>
            <p className="text-white/80 text-sm md:text-base lg:text-right">
              8000+ Talented Designers Launched !
            </p>
          </div>

          {/* Main Hero Section */}
          <div className="text-center">
            <motion.p
              className="text-white/80 text-xs sm:text-sm tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Seats for Next Program Opening Soon
            </motion.p>

            <motion.h1
              className="text-5xl sm:text-7xl md:text-8xl xl:text-9xl font-medium tracking-tighter leading-[0.85]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-white block">Become</span>
              <span className="block">
                <ShinyText>Product Leader.</ShinyText>
              </span>
            </motion.h1>

            {/* CTA Button */}
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button className="group px-6 md:px-8 py-3 md:py-4 bg-black hover:bg-gray-900 rounded-full text-white font-medium flex items-center gap-2 mx-auto transition-colors">
                Apply for Next Enrollment
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}