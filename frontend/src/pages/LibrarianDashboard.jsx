import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LibrarianDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requested');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    requested: 0,
    returned: 0
  });

  useEffect(() => {
    fetchBooks();
    fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      console.log('Fetching book stats...');
      const response = await axios.get('/api/library/book-stats');
      console.log('Stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      console.log('Error response:', error.response);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      console.log('Fetching book requests with status:', activeTab === 'requested' ? 'borrowed' : 'returned');
      
      const response = await axios.get('/api/library/book-requests', {
        params: { status: activeTab === 'requested' ? 'borrowed' : 'returned' }
      });
      
      console.log('Book requests response:', response.data);
      
      if (response.data && response.data.data) {
        setBooks(response.data.data);
      } else {
        setBooks([]);
        console.warn('No data property found in the response:', response.data);
      }
    } catch (error) {
      console.error('Failed to load book requests:', error);
      console.log('Error response:', error.response);
      setError(t('librarian.errors.failedToLoad', { message: error.response?.data?.message || error.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReturned = async (bookId, studentId) => {
    try {
      console.log('Marking book as returned:', { bookId, studentId });
      const response = await axios.post(`/api/library/${bookId}/return`, { student_id: studentId });
      console.log('Return response:', response.data);
      
      // Show success message
      alert(t('librarian.alerts.bookReturned'));
      
      // Refresh data
      fetchBooks();
      fetchStats();
    } catch (error) {
      console.error('Failed to mark book as returned:', error);
      alert(error.response?.data?.message || t('librarian.errors.returnFailed'));
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return t('common.na');
    return new Date(dateString).toLocaleDateString();
  };

  if (!user || (user.role !== 'librarian' && user.role !== 'administrator')) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">{t('common.accessDenied')}</h2>
          <p className="text-gray-600">{t('librarian.errors.noPermission')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('librarian.dashboard.title')}</h1>
        <button 
          onClick={() => {fetchBooks(); fetchStats();}}
          className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> {t('common.refreshData')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-md">
              <BookOpen className="h-6 w-6 text-blue-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">{t('librarian.stats.booksRequested')}</p>
              <p className="text-xl font-semibold">{stats.requested}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-md">
              <CheckCircle className="h-6 w-6 text-green-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">{t('librarian.stats.booksReturned')}</p>
              <p className="text-xl font-semibold">{stats.returned}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('requested')}
            className={`py-4 px-1 relative font-medium text-sm ${
              activeTab === 'requested'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('librarian.tabs.requestedBooks')}
            {stats.requested > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {stats.requested}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('returned')}
            className={`py-4 px-1 relative font-medium text-sm ${
              activeTab === 'returned'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('librarian.tabs.returnHistory')}
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {activeTab === 'requested' && <BookOpen className="h-8 w-8 text-gray-400" />}
              {activeTab === 'returned' && <CheckCircle className="h-8 w-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {activeTab === 'requested' ? t('librarian.empty.noRequestedBooks.title') : t('librarian.empty.noReturnedBooks.title')}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'requested' && t('librarian.empty.noRequestedBooks.message')}
              {activeTab === 'returned' && t('librarian.empty.noReturnedBooks.message')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('librarian.table.headers.student')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('librarian.table.headers.book')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('librarian.table.headers.requestDate')}
                  </th>
                  {activeTab === 'requested' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('librarian.table.headers.status')}
                    </th>
                  )}
                  {activeTab === 'returned' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('librarian.table.headers.returnDate')}
                    </th>
                  )}
                  {activeTab === 'requested' && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('librarian.table.headers.actions')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{book.student.name}</div>
                          <div className="text-sm text-gray-500">{book.student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">{t('librarian.table.bookBy', { author: book.author })}</div>
                      <div className="text-xs text-gray-400 mt-1">{t('librarian.table.inventoryNumber', { number: book.inventory_number })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(book.request_date)}
                    </td>
                    
                    {activeTab === 'requested' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {t('librarian.status.waitingForReturn')}
                        </span>
                      </td>
                    )}
                    
                    {activeTab === 'returned' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(book.return_date)}
                      </td>
                    )}
                    
                    {activeTab === 'requested' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleMarkReturned(book.id, book.student.id)}
                          className="bg-green-100 hover:bg-green-200 text-green-800 py-1 px-3 rounded-md transition-colors"
                        >
                          {t('librarian.actions.markReturned')}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}