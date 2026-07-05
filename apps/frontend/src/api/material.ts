import api from './axios';

export interface Material {
  id: string;
  code: string;
  name: string;
  spec: string;
  unit: string;
  category: string;
  price: number;
  tenantId: string;
}

export const getMaterials = async (_tenantId: string) => {
  return api.get('/materials');
};

export const createMaterial = async (data: Omit<Material, 'id' | 'tenantId'>) => {
  return api.post('/materials', data);
};

export const updateMaterial = async (id: string, data: Partial<Material>) => {
  return api.put(`/materials/${id}`, data);
};

export const deleteMaterial = async (id: string) => {
  return api.delete(`/materials/${id}`);
};
