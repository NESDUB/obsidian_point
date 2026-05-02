'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  Home,
  ShieldCheck,
  TrendingUp,
  Menu,
  X,
  MapPin,
  Target,
} from 'lucide-react'
import Link from 'next/link'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#111316]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
      <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gradient-to-br from-[#f4efe6]/30 via-[#2c3034] to-[#030405] border border-white/10" />
          <span className="text-[14px] font-light uppercase tracking-[0.4em] text-[#F3EFE7]">Obsidian Point</span>
        </div>

        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-[11px] uppercase tracking-[0.2em] text-[#9A948A] hover:text-[#F3EFE7] transition-colors">
              {link.name}
            </a>
          ))}
          <Link
            href="/auth/login"
            className="px-6 py-2 border border-[#D9D0C0]/20 text-[11px] uppercase tracking-[0.2em] text-[#F3EFE7] hover:bg-[#F3EFE7] hover:text-[#111316] transition-all"
          >
            Access Portal
          </Link>
        </div>

        <button className="md:hidden text-[#F3EFE7]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-[#181a1d] border-b border-white/10 p-8 flex flex-col gap-6 md:hidden"
          >
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-[12px] uppercase tracking-[0.2em] text-[#F3EFE7]">
                {link.name}
              </a>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-4 border border-[#D9D0C0]/20 text-[11px] uppercase tracking-[0.2em] text-[#F3EFE7] text-center"
            >
              Access Portal
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

function Hero() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.075),transparent_34%)]" />
      <motion.div
        style={{ y: y1 }}
        className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:72px_72px]"
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-8 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-8 bg-[#F3EFE7]/30" />
            <span className="text-[10px] uppercase tracking-[0.5em] text-[#9A948A]">Investment & Property Management</span>
            <div className="h-px w-8 bg-[#F3EFE7]/30" />
          </div>

          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-light leading-[1.1] tracking-[-0.03em] text-[#F3EFE7] mb-10 max-w-5xl mx-auto">
            Acquiring Value. <br />
            <span className="text-[#807970]">Delivering Excellence.</span>
          </h1>

          <p className="text-[16px] md:text-[18px] font-light text-[#9A948A] max-w-2xl mx-auto mb-14 leading-relaxed tracking-wide">
            We identify undervalued residential assets, execute disciplined renovations, and create long-term value through professional operational management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="#portfolio" className="group relative flex h-[58px] px-10 items-center justify-center overflow-hidden border border-[#D9D0C0]/20 bg-[#D8D1C5] text-[11px] font-semibold uppercase tracking-[0.32em] text-[#161719] transition-all hover:bg-[#EFEAE2] hover:shadow-[0_14px_34px_rgba(255,255,255,.08)]">
              View Portfolio
              <ArrowRight size={14} className="ml-3 transition-transform group-hover:translate-x-1" />
            </a>
            <Link href="/auth/login" className="px-10 h-[58px] flex items-center border border-[#D9D0C0]/20 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#F3EFE7] hover:bg-white/5 transition-all">
              Investment Ops
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent hidden md:block" />
      <div className="absolute right-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent hidden md:block" />
    </section>
  )
}

function Services() {
  const services = [
    {
      title: 'Strategic Acquisition',
      desc: 'Disciplined analysis of market fundamentals to identify residential properties with significant value-add potential.',
      icon: <Target size={24} className="text-[#F3EFE7]/40" />,
      tag: '01',
    },
    {
      title: 'Value-Add Renovation',
      desc: 'Execution of thoughtful, high-standard renovations that enhance property desirability and long-term appreciation.',
      icon: <TrendingUp size={24} className="text-[#F3EFE7]/40" />,
      tag: '02',
    },
    {
      title: 'Professional Management',
      desc: 'Comprehensive operational oversight ensuring superior tenant experiences and optimized asset performance.',
      icon: <ShieldCheck size={24} className="text-[#F3EFE7]/40" />,
      tag: '03',
    },
    {
      title: 'Portfolio Strategy',
      desc: 'Scaling residential portfolios with a focus on sustainable cash flow and capital preservation for the long term.',
      icon: <Home size={24} className="text-[#F3EFE7]/40" />,
      tag: '04',
    },
  ]

  return (
    <section id="services" className="py-32 bg-[#111316] relative">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.5em] text-[#9A948A] block mb-4">Core Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-[#F3EFE7]">A focused approach to residential investing.</h2>
          </div>
          <div className="h-px bg-white/10 flex-grow mx-8 hidden md:block mb-6" />
          <div className="text-[12px] uppercase tracking-[0.2em] text-[#9A948A]/60 font-mono">
            OPERATIONAL RIGOR / 01
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
          {services.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              className="bg-[#181a1d] p-10 flex flex-col h-full min-h-[320px] relative group overflow-hidden"
            >
              <div className="text-[9px] font-mono tracking-[0.2em] text-[#9A948A]/40 mb-12 flex justify-between">
                <span>{s.tag}</span>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mb-6">{s.icon}</div>
              <h3 className="text-xl font-light tracking-tight text-[#F3EFE7] mb-4">{s.title}</h3>
              <p className="text-[14px] text-[#9A948A] leading-relaxed font-light mb-8">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Portfolio() {
  const properties = [
    {
      name: 'The Obsidian House',
      location: 'San Jose, CA',
      type: 'Single Family',
      metrics: { 'Cap Rate': '6.2%', 'Value Change': '+18%', 'Tenant Status': 'Occupied' },
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Quartzite Residences',
      location: 'Austin, TX',
      type: 'Duplex',
      metrics: { 'Cap Rate': '5.8%', 'Value Change': '+12%', 'Tenant Status': 'Occupied' },
      image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800',
    },
  ]

  return (
    <section id="portfolio" className="py-32 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 relative z-10">
        <div className="mb-20">
          <span className="text-[10px] uppercase tracking-[0.5em] text-[#9A948A] block mb-4">Portfolio Highlights</span>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-[#F3EFE7]">Select Assets.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {properties.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden border border-white/5 mb-8">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                />
                <div className="absolute top-6 left-6 z-20 flex gap-2">
                  <span className="px-3 py-1 bg-[#111316]/80 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-[0.2em] text-[#F3EFE7]">{p.type}</span>
                  <span className="px-3 py-1 bg-[#111316]/80 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-[0.2em] text-green-400/70">{p.metrics['Tenant Status']}</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                  <h3 className="text-2xl font-light text-[#F3EFE7] mb-1">{p.name}</h3>
                  <div className="flex items-center gap-2 text-[#9A948A] text-[12px] uppercase tracking-widest">
                    <MapPin size={12} strokeWidth={1.5} />
                    {p.location}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 pr-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#9A948A]/50 mb-1">Cap Rate</div>
                    <div className="text-[14px] text-[#F3EFE7] font-medium">{p.metrics['Cap Rate']}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#9A948A]/50 mb-1">Equity Gain</div>
                    <div className="text-[14px] text-[#F3EFE7] font-medium">{p.metrics['Value Change']}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="py-32 relative bg-[#181a1d]">
      <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <div className="aspect-[4/5] bg-[#111316] border border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
              alt="Founder"
              className="w-full h-full object-cover grayscale opacity-60"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 border border-white/10 hidden xl:block" />
          <div className="absolute top-10 -left-10 h-32 w-1 bg-[#F3EFE7]/20" />
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.5em] text-[#9A948A] block mb-6">Our Foundation</span>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-[#F3EFE7] mb-10 leading-tight">
            Built on discipline. <br />
            Driven by results.
          </h2>
          <p className="text-[16px] text-[#9A948A] leading-relaxed font-light mb-8 max-w-xl">
            Obsidian Point was founded with a singular mission: to apply the principles of military discipline, precision, and strategic planning to residential real estate investment.
          </p>
          <p className="text-[16px] text-[#9A948A] leading-relaxed font-light mb-12 max-w-xl">
            We don't look for quick wins. We look for sustainable growth and operational excellence. Our background in service translates into a commitment to our tenants and a rigorous fiduciary duty to our partners.
          </p>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <div className="text-[28px] font-light text-[#F3EFE7] mb-1">SDVOSB</div>
              <div className="text-[10px] uppercase tracking-widest text-[#9A948A]">Verified Status</div>
            </div>
            <div>
              <div className="text-[28px] font-light text-[#F3EFE7] mb-1">100%</div>
              <div className="text-[10px] uppercase tracking-widest text-[#9A948A]">Operational Duty</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="py-32 bg-[#111316] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="max-w-[1440px] mx-auto px-8 text-center relative z-10">
        <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-[#F3EFE7] mb-12">Let's discuss opportunities.</h2>
        <p className="text-[#9A948A] text-[18px] max-w-2xl mx-auto mb-16 leading-relaxed">
          Whether you're a potential investment partner, a future business collaborator, or interested in one of our high-quality rental assets, we're ready to talk.
        </p>
        <button className="px-14 py-6 border border-[#D9D0C0]/20 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#F3EFE7] hover:bg-[#F3EFE7] hover:text-[#111316] transition-all duration-500">
          Inquire Now
        </button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-20 border-t border-white/5 bg-[#111316]">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-6 w-6 bg-white/10 border border-white/10" />
              <span className="text-[12px] font-light uppercase tracking-[0.4em] text-[#F3EFE7]">Obsidian Point</span>
            </div>
            <p className="text-[#9A948A] text-[11px] uppercase tracking-widest leading-loose">
              Strategic Real Estate Investment<br />
              & Property Management
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 md:gap-24">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#F3EFE7] mb-6">Company</div>
              <div className="flex flex-col gap-4">
                <a href="#portfolio" className="text-[11px] text-[#9A948A] hover:text-white transition-colors">Portfolio</a>
                <a href="#services" className="text-[11px] text-[#9A948A] hover:text-white transition-colors">Services</a>
                <a href="#about" className="text-[11px] text-[#9A948A] hover:text-white transition-colors">About</a>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#F3EFE7] mb-6">Inquiries</div>
              <div className="flex flex-col gap-4">
                <a href="#" className="text-[11px] text-[#9A948A] hover:text-white transition-colors">Investing</a>
                <a href="#" className="text-[11px] text-[#9A948A] hover:text-white transition-colors">Careers</a>
                <a href="#" className="text-[11px] text-[#9A948A] hover:text-white transition-colors">Partnerships</a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5">
          <div className="text-[10px] uppercase tracking-widest text-[#9A948A]/40 flex items-center gap-6">
            <span>© 2026 Obsidian Point LLC</span>
            <span>All Rights Reserved</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] uppercase tracking-widest text-[#9A948A]/40 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-[10px] uppercase tracking-widest text-[#9A948A]/40 hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="font-sans bg-[#111316] selection:bg-[#ECE8DF] selection:text-[#111316]">
      <Navbar />
      <Hero />
      <Services />
      <Portfolio />
      <About />
      <Contact />
      <Footer />
    </div>
  )
}
