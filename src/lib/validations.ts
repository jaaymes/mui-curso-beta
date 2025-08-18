import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Nome de usuário é obrigatório')
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const userSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter menos de 50 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Por favor, insira um endereço de email válido'),
  role: z.enum(['admin', 'user'], {
    message: 'Por favor, selecione uma função',
  }),
  firstName: z
    .string()
    .min(1, 'Primeiro nome é obrigatório')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .optional(),
  username: z
    .string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .optional(),
  phone: z
    .string()
    .optional(),
  age: z
    .number()
    .min(13, 'Idade deve ser pelo menos 13')
    .max(120, 'Idade deve ser menor que 120')
    .optional(),
});

export const userUpdateSchema = userSchema.partial();

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome do produto é obrigatório')
    .min(2, 'Nome do produto deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do produto deve ter menos de 100 caracteres'),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter menos de 500 caracteres'),
  price: z
    .number()
    .min(0.01, 'Preço deve ser maior que 0')
    .max(999999, 'Preço deve ser menor que 1.000.000'),
  category: z
    .string()
    .min(1, 'Categoria é obrigatória'),
  stock: z
    .number()
    .min(0, 'Estoque não pode ser negativo')
    .max(99999, 'Estoque deve ser menor que 100.000'),
});

export const productUpdateSchema = productSchema.partial();

export const filterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  role: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductUpdateFormData = z.infer<typeof productUpdateSchema>;
export type FilterFormData = z.infer<typeof filterSchema>;