import { User, Role } from '@/types/api';

export function canViewProfit(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'MANAGER';
}

export function canManageUsers(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'ADMIN';
}

export function canManagePurchases(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'MANAGER';
}

export function canManageCompanies(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'MANAGER';
}

export function canManageProducts(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'MANAGER';
}

export function canSeeBuyPrice(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'MANAGER';
}

export function canManageStockAndDamage(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'MANAGER';
}
