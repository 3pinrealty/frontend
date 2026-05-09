import { ContactForm } from '../components/ContactForm'
import { buildPayload } from '../utils/formPayload'
import '../styles/contact.css'

export function ContactPage() {
  const submitContactForm = async (form) => {
  try {
    const payload = buildPayload(form, ['name', 'phone', 'email', 'message'])

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      let apiError = 'Failed to submit';
      try {
        const errJson = await response.json();
        apiError = errJson?.error || errJson?.message || apiError;
      } catch (_) {
        // keep default message if body is not JSON
      }
      throw new Error(apiError);
    }

    return true;

  } catch (err) {
    console.error("❌ Contact submit error:", err);
    throw err;
  }
};
  return (
    <div className="contact-section">
      <div className="contact-section__container">
        {/* Left Column - Contact Info */}
        <div className="contact-section__left">
          <div className="contact-section__header">
            <h1 className="contact-section__title">Get In Touch</h1>
            <p className="contact-section__subtitle">
              Let's find your perfect property or discuss an exclusive opportunity
            </p>
          </div>

          <div className="contact-section__info-card">
            {/* Office Hours */}
            <div className="contact-section__info-block">
              <div className="contact-section__info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="contact-section__info-label">Office Hours</h3>
                <p className="contact-section__info-text">Every Day</p>
                <p className="contact-section__info-text">9:00 AM – 7:00 PM</p>
              </div>
            </div>

            {/* Email */}
            <div className="contact-section__info-block">
              <div className="contact-section__info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </div>
              <div>
                <h3 className="contact-section__info-label">Email</h3>
                <a href="mailto:3pinrentals@gmail.com" className="contact-section__info-link">
                  3pinrentals@gmail.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="contact-section__info-block">
              <div className="contact-section__info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div>
                <h3 className="contact-section__info-label">Phone</h3>
                <a href="tel:+234800000000" className="contact-section__info-link">
                  +91 9080895163
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="contact-section__right">
          <ContactForm
            title="Send Us a Message"
            subtitle="We'll get back to you within 24 hours"
            onSubmit={submitContactForm}
          />
        </div>
      </div>
    </div>
  )
}
