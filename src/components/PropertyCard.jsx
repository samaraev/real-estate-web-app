import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RotatingBadge from "./RotatingBadge";
import RotatingBadgeOpenHouse from "./RotatingBadgeOpenHouse";

const rotateAnimation = {
  animate: { rotate: 360 },
  transition: { duration: 20, repeat: Infinity, ease: "linear" }
};

export default function PropertyCard({ property, size = "default", showBadge = false, badgeType = "new" }) {
  const formatPrice = (price) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price}`;
  };

  const isLarge = size === "large";

  return (
    <Link to={`/property/${property.id}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}>
        
        <div className={`relative overflow-hidden ${isLarge ? "aspect-[16/9]" : "aspect-[5/4]"}`}>
          <img
            src={property.featured_image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
          
          {showBadge && (badgeType === "openhouse" ? <RotatingBadgeOpenHouse /> : <RotatingBadge />)}
          {/* Gradient glass overlay — appears on hover, fades from black/60 at bottom to transparent */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 ease-out"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)", backdropFilter: "blur(0px)" }} />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-0 opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-700 ease-out">
            <div className="flex items-end justify-between text-white">
              <span className="font-display text-2xl font-light">{formatPrice(property.price)}</span>
              <span className="font-body text-xs tracking-label uppercase">{property.sqft?.toLocaleString()} sqft</span>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-6 px-[2%]">
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
            {property.neighborhood || property.city} · {property.property_type}
          </p>
          <h3 className="font-display font-light text-display-sm">
            {property.title}
          </h3>
          <div className="flex items-center gap-4 mt-2 font-body text-sm text-muted-foreground">
            <span>{property.bedrooms} Bed</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{property.bathrooms} Bath</span>
            {property.garage > 0 &&
            <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{property.garage} Garage</span>
              </>
            }
          </div>
        </div>
      </motion.div>
    </Link>);

}