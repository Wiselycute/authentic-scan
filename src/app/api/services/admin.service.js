import { request } from './base.service';

export const getAdminAnalytics = async () => {
  return request('/admin/analytics');
};

export const getScanById = async (scanId) => {
  return request(`/scans/${scanId}`);
};

export const getAdminScanById = async (scanId) => {
  return request(`/admin/scans/${scanId}`);
};
