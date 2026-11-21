import { useParams } from 'react-router-dom';
import { getCategoryBySlug } from '../data/categories';
import { NotFoundPage } from './NotFoundPage';
import { ProductsPage } from './ProductsPage';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = slug ? getCategoryBySlug(slug) : undefined;

  if (!category) {
    return <NotFoundPage />;
  }

  return <ProductsPage lockedCategorySlug={category.slug} />;
}
