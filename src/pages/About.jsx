import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Users, MapPin, Heart } from "lucide-react";

import InquiryForm from "../components/InquiryForm";
import MissionSection from "../components/about/MissionSection";
import AdvisorsSection from "../components/about/AdvisorsSection";
import CredentialsSection from "../components/about/CredentialsSection";

export default function About() {
  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  const impacts = [
    { icon: Heart, title: "Habitat for Humanity", description: "Annual partnership building homes for families in need across the metropolitan area." },
    { icon: Users, title: "Youth Mentorship", description: "Sponsoring internship programs for underrepresented students pursuing real estate careers." },
    { icon: MapPin, title: "Historic Preservation", description: "Active stewardship of the city's architectural heritage through restoration advocacy." }
  ];


  return (
    <div className="pt-32 pb-24">
      <MissionSection />

      <div className="hairline max-w-[1400px] mx-auto" />

      <AdvisorsSection />

      <div className="hairline max-w-[1400px] mx-auto" />

      <CredentialsSection />

      {/* Community Impact */}
      <section className="py-24 md:py-40 bg-secondary/30">
        <div className="px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-display-lg font-light mt-3">
              Community <span className="italic">Impact</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {impacts.map((impact, i) =>
            <motion.div
              key={impact.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="text-center">
              
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="flex justify-center mb-4"
                >
                  <impact.icon size={28} className="text-accent" />
                </motion.div>
                <h3 className="font-display text-xl font-light mb-3">{impact.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{impact.description}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Full bleed photo */}
      <div className="w-full h-[500px] md:h-[650px] overflow-hidden relative">
        <motion.div
          ref={parallaxRef}
          className="absolute inset-0 w-full h-[140%] top-[-20%]"
          style={{ y: parallaxY }}
        >
          <img
            src="https://media.base44.com/images/public/6a0c3ea982f98940623f21f5/199673b62_Base44_Templates_Gemini_3__Nano_Banana_Pro__2026-05-24_05-57-46.jpeg"
            alt="Luxury property"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Contact / Inquiry */}
      <section id="contact" className="py-12 md:py-40 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
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