import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 50);
      setHidden(currentY > lastScrollY && currentY > 200);
      setLastScrollY(currentY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
   { label: "Properties", path: "/properties" },
   { label: "Sell", path: "/sell" },
   { label: "About", path: "/about" }];

  const isHomepage = location.pathname === "/";
  const textColor = isHomepage ? "text-white" : scrolled ? "text-foreground" : "text-foreground";
  const linkColor = isHomepage ? "text-white/70" : "text-foreground/70";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        hidden ? "-translate-y-full" : "translate-y-0"} ${

        scrolled ?
        (isHomepage ? "bg-foreground/60 backdrop-blur-xl" : "bg-background/95 backdrop-blur-xl border-b border-border/50") :
        "bg-transparent"}`
        }>
        
        <div className="w-full px-[4%] md:px-[2%]">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link to="/" className="relative z-10">
              <span className={`font-display text-2xl md:text-3xl 3xl:text-4xl font-light tracking-editorial ${menuOpen ? "text-foreground" : textColor}`}>MAISON

              </span>
              <span className={`font-display text-2xl md:text-3xl 3xl:text-4xl font-light tracking-editorial ${menuOpen ? "text-accent" : isHomepage ? "text-[#facca3]" : "text-accent"}`}> ESTATE

              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) =>
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-xs tracking-label uppercase relative group pb-1 ${
                location.pathname === link.path ? "text-accent" : isHomepage ? "text-white" : "text-foreground"}`}
                >
                   {link.label}
                   <span className="absolute bottom-0 left-0 w-full h-px bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
              )}
              <Link
                to="/properties"
                className={`text-xs px-8 py-3 text-sm font-body tracking-widest uppercase transition-all duration-500 rounded-full border ${isHomepage ? "border-white bg-white text-black hover:bg-white/80" : "border-foreground bg-foreground text-background hover:bg-foreground/80"}`}>

                View Listings
              </Link>
            </nav>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden relative z-10 p-2 ${menuOpen ? "text-foreground" : textColor}`}
              aria-label="Toggle menu">

              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-40 bg-background flex flex-col items-start justify-center px-[4%]">
          
            <nav className="flex flex-col items-start gap-6">
              {navLinks.map((link, i) =>
            <motion.div
              key={link.path}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}>
              
                  <Link
                  to={link.path}
                  className="font-display text-display-md text-foreground hover:text-[#976620] transition-colors text-left">
                
                    {link.label}
                  </Link>
                </motion.div>
            )}
              <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}>
              
                <Link to="/properties" className="ghost-btn text-sm mt-6">
                  View Listings
                </Link>
              </motion.div>

              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex flex-col items-start gap-2 text-muted-foreground font-body text-xs tracking-label uppercase">
              
                <span>Penthouses</span>
                <span>Waterfront</span>
                <span>Modernist Retreats</span>
                <span>Estates</span>
              </motion.div>
            </nav>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}