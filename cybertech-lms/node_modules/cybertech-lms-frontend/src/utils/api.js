import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cybertech_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cybertech_token');
      localStorage.removeItem('cybertech_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const getError = (err) => err?.response?.data?.message || err?.message || 'Something went wrong';

// COURSES
export const coursesAPI = {
  getAll:      (params = {}) => api.get('/courses', { params }),
  getAllAdmin:  ()            => api.get('/courses/all'),
  getById:     (id)          => api.get(`/courses/${id}`),
  create:      (data)        => api.post('/courses', data),
  update:      (id, data)    => api.put(`/courses/${id}`, data),
  delete:      (id)          => api.delete(`/courses/${id}`),
};

// ENROLLMENTS — full payment + approval flow
export const enrollmentsAPI = {
  // Student: pay and enroll
  payDirect: (data) => api.post('/enrollments/pay-direct', data),

  // Student: get my enrollments
  getMine: () => api.get('/enrollments/my'),

  // Student: check enrollment for a specific course
  checkCourse: (courseId) => api.get(`/enrollments/check/${courseId}`),

  // Student: update progress
  updateProgress: (enrollmentId, lessonId, progress) =>
    api.put(`/enrollments/${enrollmentId}/progress`, { lessonId, progress }),

  // Admin: all enrollments
  getAllAdmin:  (params = {}) => api.get('/enrollments/admin/all', { params }),

  // Admin: approve
  approve: (id, data = {}) => api.put(`/enrollments/admin/approve/${id}`, data),

  // Admin: reject
  reject: (id, data = {}) => api.put(`/enrollments/admin/reject/${id}`, data),

  // Admin: extend validity
  extend: (id, additionalMonths) => api.put(`/enrollments/admin/extend/${id}`, { additionalMonths }),

  // Admin: resend credentials
  resendCredentials: (id) => api.post(`/enrollments/admin/resend-credentials/${id}`),

  // Admin: expiring soon
  getExpiring: () => api.get('/enrollments/admin/expiring'),
};

// STUDENTS
export const studentsAPI = {
  getAll:       (params = {}) => api.get('/students', { params }),
  getById:      (id)          => api.get(`/students/${id}`),
  create:       (data)        => api.post('/students', data),
  update:       (id, data)    => api.put(`/students/${id}`, data),
  toggleStatus: (id)          => api.patch(`/students/${id}/toggle-status`),
  delete:       (id)          => api.delete(`/students/${id}`),
};

// TRAINERS
export const trainersAPI = {
  getAll:      (params = {}) => api.get('/trainers', { params }),
  getAllAdmin:  ()            => api.get('/trainers/all'),
  getById:     (id)          => api.get(`/trainers/${id}`),
  create:      (data)        => api.post('/trainers', data),
  update:      (id, data)    => api.put(`/trainers/${id}`, data),
  delete:      (id)          => api.delete(`/trainers/${id}`),
};

// MATERIALS
export const materialsAPI = {
  getAll:         ()         => api.get('/materials'),
  getByCourse:    (courseId) => api.get(`/materials/course/${courseId}`),
  upload:         (fd)       => api.post('/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:         (id, data) => api.put(`/materials/${id}`, data),
  delete:         (id)       => api.delete(`/materials/${id}`),
  getDownloadUrl: (id)       => `/api/materials/${id}/download`,
};

// ADMIN
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  assignCourse:      (userId, courseId) => api.post('/admin/assign-course', { userId, courseId }),
  getAllPayments:     () => api.get('/admin/payments'),
};

// PAYMENTS
export const paymentsAPI = {
  getAll:  () => api.get('/admin/payments'),
  getMine: () => api.get('/payments/my'),
};

export default api;
