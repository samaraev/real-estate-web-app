import { motion } from "framer-motion";
import { Home, TrendingUp, Key, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
{
  icon: Home,
  title: "Buyer Representation",
  description: "From discovery to closing, our agents provide end-to-end guidance with access to pre-market and exclusive listings."
},
{
  icon: TrendingUp,
  title: "Seller Strategy",
  description: "Maximize your property's value with our data-driven pricing, architectural staging, and targeted marketing."
},
{
  icon: Key,
  title: "Property Management",
  description: "Preserve and grow your investment with our concierge-level management services for luxury properties."
},
{
  icon: FileText,
  title: "Market Advisory",
  description: "Leverage our deep market intelligence for informed investment decisions and portfolio optimization."
}];


export default function ServicesOverview() {
  return (
    <section className="py-24 md:py-40 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
        <div>
          <h2 className="font-display text-display-lg font-light mt-3">
            Buyer & Seller<br />
            <span className="italic">Services</span>
          </h2>
          <p className="font-body text-muted-foreground text-base mt-6 leading-snug max-w-md">
            Whether acquiring your legacy residence or positioning your property 
            for the discerning market, our approach is both artful and analytical.
          </p>
          <Link to="/sell#contact" className="ghost-btn inline-block mt-8 text-sm">LEARN MORE

          </Link>
        </div>

        <div className="space-y-0">
          {services.map((service, i) =>
          <motion.div
            key={service.title}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="py-8 border-b border-border/90 first:border-t">
            
              <div className="flex items-start gap-5">
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }} transition={{ duration: 0.3 }}>
                  <service.icon size={20} className="text-accent mt-1 flex-shrink-0" />
                </motion.div>
                <div>
                  <h3 className="font-display text-xl font-light mb-2">{service.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}