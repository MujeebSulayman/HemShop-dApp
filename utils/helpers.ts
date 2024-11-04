export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const findProductBySlug = (products: any[], slug: string) => {
  return products.find(product => generateSlug(product.name) === slug);
}; 