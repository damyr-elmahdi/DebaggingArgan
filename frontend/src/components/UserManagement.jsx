import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function UserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    grade: '',
    recovery_email: '',
    department: '',
    position: '',
    specialization: '',
    admin_level: 'basic'
  });
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = filter ? `/api/users?role=${filter}` : '/api/users';
      const response = await axios.get(url);
      setUsers(response.data.data || response.data);
      setError('');
    } catch (err) {
      setError(t('userManagement.messages.errors.fetchFailed', {
        error: err.response?.data?.message || err.message
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (formMode === 'create') {
        const response = await axios.post('/api/users', formData);
        setUsers([response.data.user, ...users]);
        setSuccessMessage(t('userManagement.messages.userCreated', {
          name: response.data.user.name,
          password: response.data.user.plaintext_password
        }));
        resetForm();
      } else if (formMode === 'edit') {
        const response = await axios.put(`/api/users/${selectedUser.id}`, formData);
        const updatedUser = response.data.user;
        setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
        
        setSuccessMessage(t('userManagement.messages.userUpdated', {
          name: updatedUser.name,
          password: response.data.user.plaintext_password || ''
        }));
        
        resetForm();
      }
    } catch (err) {
      setError(t('userManagement.messages.errors.operationFailed', {
        error: err.response?.data?.message || err.message
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setFormMode('edit');
    setSelectedUser(user);
    
    const userData = {
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      grade: '',
      recovery_email: '',
      department: '',
      position: '',
      specialization: '',
      admin_level: 'basic'
    };
    
    if (user.role === 'student' && user.student) {
      userData.grade = user.student.grade || '';
      userData.recovery_email = user.student.recovery_email || '';
    } else if (user.role === 'teacher' && user.teacher) {
      userData.department = user.teacher.department || '';
      userData.position = user.teacher.position || '';
      userData.specialization = user.teacher.specialization || '';
    } else if (user.role === 'administrator' && user.administrator) {
      userData.admin_level = user.administrator.admin_level || 'basic';
      userData.department = user.administrator.department || '';
    }
    
    setFormData(userData);
    setShowForm(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('userManagement.confirmations.deleteUser'))) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`/api/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      setSuccessMessage(t('userManagement.messages.userDeleted'));
    } catch (err) {
      setError(t('userManagement.messages.errors.deleteFailed', {
        error: err.response?.data?.message || err.message
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm(t('userManagement.confirmations.resetPassword'))) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`/api/users/${userId}/reset-password`);
      setSuccessMessage(t('userManagement.messages.passwordReset', {
        password: response.data.new_password
      }));
    } catch (err) {
      setError(t('userManagement.messages.errors.resetFailed', {
        error: err.response?.data?.message || err.message
      }));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPassword(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      grade: '',
      recovery_email: '',
      department: '',
      position: '',
      specialization: '',
      admin_level: 'basic'
    });
    setSelectedUser(null);
    setFormMode('create');
    setShowForm(false);
  };

  const dismissMessage = () => {
    setSuccessMessage('');
    setError('');
  };

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('userManagement.title')}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {t('userManagement.description')}
          </p>
        </div>
        <div className="flex space-x-4">
          <select 
            className="rounded-md border-gray-300 shadow-sm focus:border-teal-400 focus:ring-teal-400"
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="">{t('userManagement.filter.allUsers')}</option>
            <option value="student">{t('userManagement.filter.students')}</option>
            <option value="teacher">{t('userManagement.filter.teachers')}</option>
            <option value="administrator">{t('userManagement.filter.administrators')}</option>
            <option value="librarian">{t('userManagement.filter.librarians')}</option>
          </select>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#18bebc] hover:bg-teal-700"
          >
            {showForm ? t('userManagement.buttons.cancel') : t('userManagement.buttons.addUser')}
          </button>
        </div>
      </div>

      {/* Success or Error Messages */}
      {(successMessage || error) && (
        <div className={`px-4 py-3 mb-4 ${successMessage ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {successMessage ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage || error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={dismissMessage}
                  className={`inline-flex rounded-md p-1.5 ${successMessage ? 'text-green-500 hover:bg-green-100' : 'text-red-500 hover:bg-red-100'}`}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Creation/Edit Form . */}
      {showForm && (
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('userManagement.form.name')}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-teal-400 focus:border-teal-400 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('userManagement.form.email')}
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-teal-400 focus:border-teal-400 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('userManagement.form.password')} {formMode === 'edit' && t('userManagement.form.passwordEditNote')}
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required={formMode === 'create'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-teal-400 focus:border-teal-400 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  {t('userManagement.form.role')}
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={formMode === 'edit'}
                    className="shadow-sm focus:ring-teal-400 focus:border-teal-400 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="student">{t('userManagement.form.roleOptions.student')}</option>
                    <option value="teacher">{t('userManagement.form.roleOptions.teacher')}</option>
                    <option value="administrator">{t('userManagement.form.roleOptions.administrator')}</option>
                    <option value="librarian">{t('userManagement.form.roleOptions.librarian')}</option>
                  </select>
                </div>
              </div>

              {/* Student-specific fields */}
              {formData.role === 'student' && (
                <>
                  <div className="sm:col-span-3">
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                      {t('userManagement.form.studentFields.grade')}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="grade"
                        id="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-teal-400 focus:border-teal-400 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="recovery_email" className="block text-sm font-medium text-gray-700">
                      {t('userManagement.form.studentFields.recoveryEmail')}
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="recovery_email"
                        id="recovery_email"
                        value={formData.recovery_email}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-teal-400 focus:border-teal-400 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Teacher-specific fields */}
              {formData.role === 'teacher' && (
                <>
                  <div className="sm:col-span-2">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      {t('userManagement.form.teacherFields.department')}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="department"
                        id="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-teal-400 focus:border-teal-400 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                      {t('userManagement.form.teacherFields.position')}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="position"
                        id="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-teal-400 focus:border-teal-400 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                      {t('userManagement.form.teacherFields.specialization')}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="specialization"
                        id="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-teal-400 focus:border-teal-400 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Administrator-specific fields */}
              {formData.role === 'administrator' && (
                <>
                  <div className="sm:col-span-3">
                    <label htmlFor="admin_level" className="block text-sm font-medium text-gray-700">
                      {t('userManagement.form.adminFields.adminLevel')}
                    </label>
                    <div className="mt-1">
                      <select
                        id="admin_level"
                        name="admin_level"
                        value={formData.admin_level}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-teal-400 focus:border-teal-400 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="basic">{t('userManagement.form.adminLevelOptions.basic')}</option>
                        <option value="intermediate">{t('userManagement.form.adminLevelOptions.intermediate')}</option>
                        <option value="super">{t('userManagement.form.adminLevelOptions.super')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      {t('userManagement.form.adminFields.department')}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="department"
                        id="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-teal-400 focus:border-teal-400 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* Submit button */}
              <div className="sm:col-span-6 flex justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
                >
                  {t('userManagement.buttons.cancel')}
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#18bebc] hover:bg-teal-700"
                >
                  {formMode === 'create' ? t('userManagement.buttons.createUser') : t('userManagement.buttons.updateUser')}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* User List */}
      <div className="border-t border-gray-200">
        {loading && !showForm ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#18bebc]"></div>
            <span className="ml-2 text-sm text-gray-500">{t('userManagement.table.loading')}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('userManagement.table.name')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('userManagement.table.email')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('userManagement.table.role')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('userManagement.table.details')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('userManagement.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      {t('userManagement.table.noUsers')}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'administrator' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 
                          user.role === 'student' ? 'bg-green-100 text-green-800' : 
                          'bg-teal-100 text-teal-800'}`}>
                          {t(`userManagement.form.roleOptions.${user.role}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.role === 'student' && user.student && (
                          <div>
                            <p><span className="font-medium">{t('userManagement.details.grade')}</span> {user.student.grade || 'N/A'}</p>
                            <p><span className="font-medium">{t('userManagement.details.id')}</span> {user.student.student_id || 'N/A'}</p>
                          </div>
                        )}
                        {user.role === 'teacher' && user.teacher && (
                          <div>
                            <p><span className="font-medium">{t('userManagement.details.dept')}</span> {user.teacher.department || 'N/A'}</p>
                            <p><span className="font-medium">{t('userManagement.details.id')}</span> {user.teacher.employee_id || 'N/A'}</p>
                          </div>
                        )}
                        {user.role === 'administrator' && user.administrator && (
                          <div>
                            <p><span className="font-medium">{t('userManagement.details.level')}</span> {user.administrator.admin_level || 'Basic'}</p>
                            <p><span className="font-medium">{t('userManagement.details.dept')}</span> {user.administrator.department || 'N/A'}</p>
                          </div>
                        )}
                        {user.role === 'librarian' && user.librarian && (
                          <div>
                            <p><span className="font-medium">{t('userManagement.details.id')}</span> {user.librarian.staff_id || 'N/A'}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {t('userManagement.buttons.edit')}
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            {t('userManagement.buttons.resetPassword')}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            {t('userManagement.buttons.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}