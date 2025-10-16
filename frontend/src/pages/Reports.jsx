import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../utils/api';

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    loadReports();
  }, [navigate]);

  const loadReports = async () => {
    try {
      const res = await reportAPI.getAll();
      setReports(res.data.reports || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      await reportAPI.upload(file);
      await loadReports();
      alert('Report uploaded successfully!');
    } catch (error) {
      alert('Failed to upload report: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    if (['doc', 'docx'].includes(ext)) return '📝';
    return '📎';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-primary"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-primary">📁 My Medical Reports</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Upload Area */}
        <div
          className={`bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-dashed transition-colors ${
            dragActive ? 'border-primary bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">📤</div>
            <h3 className="text-xl font-semibold mb-2">Upload Medical Report</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className={`inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold cursor-pointer hover:bg-primary-dark transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
            </p>
          </div>
        </div>

        {/* Reports List */}
        {reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{getFileIcon(report.filename)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate" title={report.filename}>
                      {report.filename}
                    </h3>
                    <p className="text-sm text-gray-500">{formatFileSize(report.file_size)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(report.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={`http://localhost:8000${report.filepath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full text-center px-4 py-2 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition-colors"
                >
                  View / Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-xl">📂 No reports uploaded yet</p>
            <p className="text-sm mt-2">Upload your medical documents to keep them organized</p>
          </div>
        )}
      </main>
    </div>
  );
}
