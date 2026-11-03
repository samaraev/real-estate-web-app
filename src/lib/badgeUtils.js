/**
 * Returns badge info for a property.
 * Centralizes badge logic so Home, PropertySearch, and PropertyDetail are in sync.
 */
export function getBadgeForProperty(property) {
  if (!property) return { showBadge: false, badgeType: "new" };

  if (property.title === "Nob Hill Elegant Residence") {
    return { showBadge: true, badgeType: "openhouse" };
  }

  if (property.title === "Nob Hill Heritage Penthouse") {
    return { showBadge: true, badgeType: "new" };
  }

  if (property.is_high_priority) {
    return { showBadge: true, badgeType: "new" };
  }

  return { showBadge: false, badgeType: "new" };
}