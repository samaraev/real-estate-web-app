import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import InquiryForm from "../components/InquiryForm";

export default function Sell() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#contact") {
      setTimeout(() => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.hash]);

  const benefits = [
  "Expert market analysis and competitive pricing",
  "Professional photography and virtual tours",
  "Targeted marketing to qualified buyers",
  "Seamless negotiation and transaction management",
  "24/7 dedicated agent support",
  "Strategic staging and presentation"];


  return (
    <div className="min-h-screen">
      {/* Intro Section */}
      <section className="pt-40 pb-24 md:pb-32 px-[2%] max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          
          <h1 className="font-display text-display-lg font-light mt-3 mb-6">
            Ready to sell?
          </h1>
          <p className="font-body text-muted-foreground max-w-[600px] leading-relaxed text-base">We understand that selling your property is one of the most important decisions you'll make. Our team of luxury real estate experts is here to guide you through every step of the process, ensuring maximum value and a seamless experience.

          </p>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12">
          
          <h2 className="font-display text-display-md font-light">
            We got you <span className="italic">covered</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {benefits.map((benefit, i) =>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="flex gap-4">
            
              <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <p className="font-body text-base text-foreground leading-relaxed">
                {benefit}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Full Width Image */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="w-full h-[500px] md:h-[700px] overflow-hidden">
        
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=800&fit=crop"
          alt="Luxury property"
          className="w-full h-full object-cover" />
        
      </motion.section>

      {/* Contact / Inquiry */}
      <div id="contact" style={{ scrollMarginTop: '80px' }} />
      <section className="py-12 md:py-16 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <h2 className="font-display text-display-lg font-light mt-3 mb-6">
              Begin Your<br />
              <span className="italic">Journey</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md">
              Whether you're seeking your next residence or considering listing your property, 
              we're here to guide you with the expertise and discretion you deserve.
            </p>
          </div>
          <div className="md:border md:border-border/50 md:p-8">
            <InquiryForm />
          </div>
        </div>
      </section>
    </div>);

}