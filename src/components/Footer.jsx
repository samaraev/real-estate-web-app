import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    await base44.entities.Inquiry.create({
      full_name: "Newsletter Subscriber",
      email,
      inquiry_type: "General",
      message: "Newsletter subscription",
    });
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-foreground text-background w-full">
      <div className="px-[2%] w-full">
        <div className="py-24 md:py-40 pb-16 md:pb-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 px-[2%] mx-auto max-w-[1400px]">
            <div>
              <h2 className="font-display text-display-lg font-light mb-6">
                Market Insights,<br />
                <span className="italic">Delivered</span>
              </h2>
              <p className="font-body text-background/60 text-sm leading-relaxed max-w-md mb-8">
                Curated intelligence on luxury real estate trends, 
                neighborhood analyses, and exclusive pre-market opportunities.
              </p>
              {subscribed ? (
                <p className="font-body text-sm tracking-label uppercase text-background/80">
                  Thank you for subscribing
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center border-b border-background/20 pb-2 max-w-md">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex-1 bg-transparent font-body text-sm text-background placeholder:text-background/40 focus:outline-none"
                    required
                  />
                  <button type="submit" className="ml-4 text-background/60 hover:text-background transition-colors">
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 md:gap-x-12 gap-y-12">
              {/* Row 1: Navigate (left) + Categories (right) */}
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">Navigate</h3>
                <nav className="flex flex-col gap-2">
                  <Link to="/" className="font-body text-sm text-background/70 hover:text-background transition-colors">Home</Link>
                  <Link to="/properties" className="font-body text-sm text-background/70 hover:text-background transition-colors">Properties</Link>
                  <Link to="/sell" className="font-body text-sm text-background/70 hover:text-background transition-colors">Sell</Link>
                  <Link to="/about" className="font-body text-sm text-background/70 hover:text-background transition-colors">About</Link>
                </nav>
              </div>
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">Categories</h3>
                <nav className="flex flex-col gap-2">
                  <Link to="/properties?type=Penthouse" className="font-body text-sm text-background/70 hover:text-background transition-colors">Penthouses</Link>
                  <Link to="/properties?type=Waterfront" className="font-body text-sm text-background/70 hover:text-background transition-colors">Waterfront</Link>
                  <Link to="/properties?type=Modernist" className="font-body text-sm text-background/70 hover:text-background transition-colors">Modernist</Link>
                  <Link to="/properties?type=Estate" className="font-body text-sm text-background/70 hover:text-background transition-colors">Estates</Link>
                </nav>
              </div>
              {/* Row 2: Contact (left) + Follow (right) */}
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">Contact</h3>
                <address className="not-italic flex flex-col gap-2 font-body text-sm text-background/70">
                  <span>500 Terry Francine St.</span>
                  <span>San Francisco, CA 94158</span>
                  <a href="tel:1234567890" className="hover:text-background transition-colors mt-1">123-456-7890</a>
                  <a href="mailto:info@mysite.com" className="hover:text-background transition-colors">info@mysite.com</a>
                </address>
              </div>
              <div>
               <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">Follow</h3>
                <nav className="flex flex-col gap-2">
                  <a href="#" className="font-body text-sm text-background/70 hover:text-background transition-colors">Instagram</a>
                  <a href="#" className="font-body text-sm text-background/70 hover:text-background transition-colors">Facebook</a>
                  <a href="#" className="font-body text-sm text-background/70 hover:text-background transition-colors">YouTube</a>
                  <a href="#" className="font-body text-sm text-background/70 hover:text-background transition-colors">Pinterest</a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10 py-6 pb-10 md:pb-8 bg-foreground w-full">
        <div className="px-[2%]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start gap-4">
            <Link to="/" className="font-display text-xl font-light tracking-editorial order-first text-white">
              MAISON <span style={{ color: "#FFCBA4" }}>ESTATE</span>
            </Link>
            <span className="font-body text-xs text-background/40 mx-auto">
              © 2035 Maison Estate. Built on Base44.
            </span>
            <div className="flex gap-4 lg:ml-0 self-center lg:self-auto">
              <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="font-body text-xs text-background/40 hover:text-background/70 transition-colors">Privacy Policy</Link>
              <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="font-body text-xs text-background/40 hover:text-background/70 transition-colors">Terms &amp; Conditions</Link>
              <Link to="/accessibility" onClick={() => window.scrollTo(0, 0)} className="font-body text-xs text-background/40 hover:text-background/70 transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}