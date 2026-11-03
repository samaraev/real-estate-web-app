import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RotatingBadge from "./RotatingBadge";

export default function FeaturedCard({ property, showBadge = false }) {
  if (!property) return null;

  const formatPrice = (price) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Link to={`/property/${property.id}`} className="group grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden border border-border/50">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[260px]">
          <img
            src={property.featured_image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-700" />
          {showBadge && <RotatingBadge />}
        </div>

        {/* Text */}
        <div className="flex flex-col justify-center px-[4%] md:px-10 py-12 bg-background">
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-3">
            {property.neighborhood || property.city} · {property.property_type}
          </p>
          <h2 className="font-display text-display-md font-light leading-tight mb-4">
            {property.title}
          </h2>
          {property.short_description && (
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm">
              {property.short_description}
            </p>
          )}
          <div className="flex items-center gap-6 font-body text-sm text-muted-foreground mb-8">
            <span>{property.bedrooms} Bed</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{property.bathrooms} Bath</span>
            {property.sqft && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{property.sqft?.toLocaleString()} sqft</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-display text-display-sm font-light">{formatPrice(property.price)}</span>
            <span className="ghost-btn text-xs">View Property</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}