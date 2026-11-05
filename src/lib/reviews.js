export const REVIEW_STATUSES = ['pending', 'published', 'rejected'];

export const averageRating = (reviews = []) => {
  const rated = reviews.filter((item) => Number(item.rating) > 0);
  if (!rated.length) return 0;
  return rated.reduce((sum, item) => sum + Number(item.rating), 0) / rated.length;
};