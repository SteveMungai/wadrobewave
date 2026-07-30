export function formatPrice(value) {
  return (value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
