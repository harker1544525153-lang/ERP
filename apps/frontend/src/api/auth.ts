import api from './axios';

export interface User {
  id: string;
  username: string;
  realName: string;
  tenantId: string;
  email: string;
  phone: string;
  status: string;
}

export const login = async (values: { username: string; password: string }) => {
  return api.post('/auth/login', values);
};

export const verify = async () => {
  return api.get('/admin/verify');
};
