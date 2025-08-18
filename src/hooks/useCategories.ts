import { useState, useEffect } from 'react';
import { ProductsService } from '@/lib/dataService';

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const categoriesData = await ProductsService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao buscar categorias');
        console.error('Error fetching categories:', err);
        // Fallback to some default categories if API fails
        setCategories(['electronics', 'beauty', 'furniture', 'groceries']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}