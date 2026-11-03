import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowLeft, Bed, Bath, Maximize, Calendar, Car, MapPin } from "lucide-react";
import InquiryForm from "../components/InquiryForm";
import RotatingBadge from "../components/RotatingBadge";
import RotatingBadgeOpenHouse from "../components/RotatingBadgeOpenHouse";
import { getBadgeForProperty } from "@/lib/badgeUtils";


export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const load = async () => {
      const all = await base44.entities.Property.list("-created_date", 100);
      const found = all.find((p) => p.id === id);
      setProperty(found);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pt-32 px-6 md:px-12 max-w-[1400px] mx-auto text-center py-24">
        <p className="font-display text-display-md">Property not found</p>
        <Link to="/properties" className="ghost-btn inline-block mt-8">Back to Collection</Link>
      </div>
    );
  }

  const images = property.images?.length > 0 ? property.images : [property.featured_image].filter(Boolean);
  const formatPrice = (price) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
  const { showBadge, badgeType } = getBadgeForProperty(property);

  const stats = [
    { icon: Bed, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Maximize, label: "Sq Ft", value: property.sqft?.toLocaleString() },
    { icon: Car, label: "Garage", value: property.garage },
    { icon: Calendar, label: "Year Built", value: property.year_built },
  ].filter((s) => s.value);

  return (
    <div className="pt-24">
      {/* Back navigation */}
      <div className="px-[2%] max-w-[1600px] mx-auto mb-8">
        <Link to="/properties" className="inline-flex items-center gap-2 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back to Collection
        </Link>
      </div>

      <div className="px-[2%] max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 3xl:gap-20">
          {/* Left: Content */}
          <div className="lg:col-span-2">
            {/* Visual showcase filmstrip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img
                      src={images[activeImage]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    {showBadge && badgeType === "openhouse" && <RotatingBadgeOpenHouse />}
                    {showBadge && badgeType === "new" && <RotatingBadge />}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`flex-shrink-0 w-20 h-20 overflow-hidden transition-opacity ${i === activeImage ? "opacity-100 ring-1 ring-accent" : "opacity-50 hover:opacity-75"}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Title & Price */}
            <div className="mt-10 mb-8">
              <h1 className="font-display text-display-md font-light mt-2">{property.title}</h1>
              <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                <MapPin size={14} />
                <span className="font-body text-sm">
                  {property.address && `${property.address}, `}{property.neighborhood && `${property.neighborhood}, `}{property.city}{property.state && `, ${property.state}`}
                </span>
              </div>
              <p className="font-display text-display-sm text-accent mt-4">{formatPrice(property.price)}</p>
            </div>

            <div className="hairline mb-8" />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center py-4 border border-border/50">
                  <stat.icon size={18} className="mx-auto text-accent mb-2" />
                  <p className="font-display text-lg">{stat.value}</p>
                  <p className="font-body text-xs text-muted-foreground tracking-label uppercase">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {property.description && (
              <div className="mb-10">
                <h2 className="font-display text-display-sm font-light mb-4">About This Property</h2>
                <p className="font-body text-sm text-muted-foreground leading-[1.8] whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            <div className="hairline mb-10" />

            {/* Features */}
            {property.features?.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display text-display-sm font-light mb-6">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-border/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      <span className="font-body text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {property.video_url && (
              <div className="mb-10">
                <h2 className="font-display text-display-sm font-light mb-6">Virtual Tour</h2>
                <div className="aspect-video">
                  <iframe
                    src={property.video_url}
                    className="w-full h-full"
                    allowFullScreen
                    title="Virtual tour"
                  />
                </div>
              </div>
            )}

            {/* Map */}
            {property.address && (
              <div className="mb-10">
                <h2 className="font-display text-display-sm font-light mb-6">Location & Amenities</h2>
                <div className="aspect-[16/9] overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps?q=${encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zip_code}`)}&z=15&output=embed`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky Inquiry */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <div className="border border-border/50 p-8">
                <h3 className="font-display text-2xl font-light mb-2">Schedule a Viewing</h3>
                <p className="font-body text-xs text-muted-foreground mb-6">
                  Our advisors respond within 24 hours
                </p>
                <InquiryForm propertyId={property.id} propertyTitle={property.title} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-24" />
    </div>
  );
}