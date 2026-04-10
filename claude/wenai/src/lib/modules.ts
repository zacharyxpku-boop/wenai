import modulesConfig from '@/config/modules.json';
import clientConfig from '@/config/client.json';

export interface Module {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: string;
  categoryLabel: string;
  icon: string;
  enabled: boolean;
  prompt: string;
}

export interface Category {
  id: string;
  label: string;
  description: string;
  color: string;
}

export function getModules(): Module[] {
  return modulesConfig.modules;
}

export function getEnabledModules(): Module[] {
  const enabledIds = new Set(clientConfig.enabledModules);
  return modulesConfig.modules.filter(m => enabledIds.has(m.id));
}

export function getModuleById(id: string): Module | undefined {
  return modulesConfig.modules.find(m => m.id === id);
}

export function getCategories(): Category[] {
  return modulesConfig.categories;
}

export function getModulesByCategory(categoryId: string): Module[] {
  const enabledIds = new Set(clientConfig.enabledModules);
  return modulesConfig.modules.filter(
    m => m.category === categoryId && enabledIds.has(m.id)
  );
}

export function getClientConfig() {
  return clientConfig;
}
