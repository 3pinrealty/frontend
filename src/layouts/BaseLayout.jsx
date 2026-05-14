import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { WhatsAppButton } from '../components/WhatsAppButton'
import Logo from '../assets/logo.jpeg'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Properties', to: '/listings' },
  { label: 'New Developments', to: '/listings?new=1' },
  { label: 'Cashback', to: '/cashback' },
  { label: 'Sell', to: '/sell' },
  { label: 'Contact', to: '/contact' },
]

function NavItem({ to, children, mobile = false }) {
  const location = useLocation()
  const isActive = location.pathname === to ||
    (to !== '/' && location.pathname.startsWith(to.split('?')[0]))

  if (mobile) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          [
            'nav-link-mobile block py-3 px-4 text-sm font-medium transition',
            isActive
              ? 'text-[var(--color-primary)] bg-[var(--color-secondary-200)]'
              : 'text-[var(--color-neutral-600)] hover:text-[var(--color-primary)] hover:bg-[var(--color-secondary-100)]',
          ].join(' ')
        }
      >
        {children}
      </NavLink>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'nav-link',
          isActive ? 'active' : '',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export function BaseLayout() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const hideFloatingActions = location.pathname === '/privacy-policy'
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-secondary)]">
      {/* Navigation - Light Minimal */}
      <Disclosure as="header" className={`main-header fixed top-0 inset-x-0 z-50 ${isScrolled ? 'main-header-scrolled' : ''}`}>
        {({ open }) => (
          <>
            <div className="header-container">
              <div className="flex items-center justify-between h-20">
                {/* Logo */}
                <NavLink to="/" className="header-logo flex items-center gap-4">
                  <img
                    src={Logo}
                    alt="Three Pin logo"
                    className="w-11 h-11 rounded-sm object-contain"
                  />
                  <div className="hidden sm:block">
                    <div className="font-serif text-lg font-medium text-[var(--color-primary)] leading-tight">
                      Three Pin
                    </div>
                    <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-[var(--color-neutral-500)]">
                      Realty
                    </div>
                  </div>
                </NavLink>

                {/* Desktop Navigation */}
                <nav className="header-nav hidden lg:flex items-center gap-10">
                  {navItems.map((item) => (
                    <NavItem key={item.label} to={item.to}>
                      {item.label}
                    </NavItem>
                  ))}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                  {/* <NavLink
                    to="/admin/login"
                    className="header-cta hidden md:inline-flex"
                  >
                    ADMIN
                  </NavLink> */}

                  {/* Mobile Menu Button */}
                  <Disclosure.Button className="header-mobile-btn lg:hidden p-2 text-[var(--color-primary)] hover:text-[var(--color-accent)] transition rounded-sm">
                    <span className="sr-only">Open menu</span>
                    {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            <Disclosure.Panel className="header-mobile-menu lg:hidden">
              <nav className="header-mobile-nav">
                {navItems.map((item) => (
                  <NavItem key={item.label} to={item.to} mobile>
                    {item.label}
                  </NavItem>
                ))}
                {/* <NavLink
                  to="/admin/login"
                  className="header-mobile-cta"
                >
                  ADMIN
                </NavLink> */}
              </nav>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Main Content */}
      <main className={`flex-1 ${isHomePage ? '' : 'pt-20'}`}>
        <Outlet />
      </main>

      {/* Footer - Light Luxury */}
      <footer className="luxury-footer-light mt-auto">
        {/* Subtle top border */}
        <div className="luxury-container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-16 md:py-20">
            {/* Brand Column */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={Logo}
                  alt="Three Pin logo"
                  className="w-11 h-11 rounded-sm object-contain"
                />
                <div>
                  <div className="font-serif text-xl font-medium text-[var(--color-primary)]">Three Pin</div>
                  <div className="font-sans text-[11px] uppercase tracking-[0.2em] text-[var(--color-neutral-500)]">
                    Realty
                  </div>
                </div>
              </div>
              <p className="font-sans text-sm text-[var(--color-neutral-500)] leading-relaxed max-w-sm mb-6">
                Curating exceptional properties for discerning clients. We specialize in luxury real estate
                and new developments across premier locations.
              </p>
              {/* Social / Trust indicators */}
              <div className="flex items-center gap-6 text-[var(--color-neutral-400)]">
                <span className="text-xs font-medium tracking-wide">Trusted by 500+ homeowners</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 md:pl-8">
              <h4 className="font-serif text-base font-medium text-[var(--color-primary)] mb-6">Quick Links</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Properties', to: '/listings' },
                  { label: 'New Developments', to: '/listings?new=1' },
                  { label: 'Cashback', to: '/cashback' },
                  { label: 'Sell Your Property', to: '/sell' },
                  { label: 'Contact', to: '/contact' },
                ].map((link) => (
                  <li key={link.label}>
                    <NavLink
                      to={link.to}
                      className="footer-link font-sans text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-accent)] transition-colors duration-200"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-4">
              <h4 className="font-serif text-base font-medium text-[var(--color-primary)] mb-6">Get in Touch</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span className="font-sans text-sm text-[var(--color-neutral-500)]">3pinrentals@gmail.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-1.268 1.577a11.217 11.217 0 01-6.743-4.502 11.217 11.217 0 01-1.577-1.268l1.577-1.268c.362-.271.527-.733.417-1.173l-1.106-4.423a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" />
                  </svg>
                  <span className="font-sans text-sm text-[var(--color-neutral-500)]">+91 9080895163</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-sans text-sm text-[var(--color-neutral-500)]">Every Day: 9:00 AM - 7:00 PM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[var(--color-neutral-200)]">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="font-sans text-xs text-[var(--color-neutral-400)]">
                © {new Date().getFullYear()} Three Pin Properties. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <NavLink to="/articles" className="footer-link text-xs text-[var(--color-neutral-400)] hover:text-[var(--color-accent)] transition-colors duration-200">
                  Articles
                </NavLink>
                <NavLink to="/contact" className="footer-link text-xs text-[var(--color-neutral-400)] hover:text-[var(--color-accent)] transition-colors duration-200">
                  Contact
                </NavLink>
                <NavLink to="/privacy-policy" className="footer-link text-xs text-[var(--color-neutral-400)] hover:text-[var(--color-accent)] transition-colors duration-200">
                  Privacy Policy
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {!hideFloatingActions && (
        <WhatsAppButton
          phone="+919080895163"
          message="I am interested in a property. Please share more details."
        />
      )}
    </div>
  )
}