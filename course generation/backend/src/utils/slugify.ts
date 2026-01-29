export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const generateUniqueSlug = (title: string, id?: string): string => {
  const baseSlug = slugify(title);
  if (id) {
    return `${baseSlug}-${id.slice(0, 8)}`;
  }
  return baseSlug;
};
