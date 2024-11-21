import React, { useState, useEffect } from 'react';
import './DirectoryModal.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const DirectoryModal = ({ isOpen, onClose, onSave }) => {
  const [directories, setDirectories] = useState([]);
  const [selectedDirectory, setSelectedDirectory] = useState('');
  const [newDirectory, setNewDirectory] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDirectories();
    }
  }, [isOpen]);

  const fetchDirectories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/directories`);
      console.log('Fetched directories:', response.data); // 添加日志查看获取到的数据
      setDirectories(response.data);
    } catch (error) {
      console.error('Failed to fetch directories:', error.message); // 输出错误信息
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  const handleCreateDirectory = async () => {
    if (!newDirectory.trim()) return;
    
    try {
      await axios.post(`${API_BASE_URL}/api/directories`, { name: newDirectory });
      await fetchDirectories();
      setNewDirectory('');
      setIsCreatingNew(false);
    } catch (error) {
      console.error('Failed to create directory:', error.message); // 输出错误信息
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  const handleSave = () => {
    onSave(selectedDirectory);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="directory-modal-overlay">
      <div className="directory-modal">
        <h2>选择保存目录</h2>
        
        <div className="directory-list">
          {directories.map((dir) => (
            <div
              key={dir}
              className={`directory-item ${selectedDirectory === dir ? 'selected' : ''}`}
              onClick={() => setSelectedDirectory(dir)}
            >
              📁 {dir}
            </div>
          ))}
        </div>

        {isCreatingNew ? (
          <div className="new-directory-input">
            <input
              type="text"
              value={newDirectory}
              onChange={(e) => setNewDirectory(e.target.value)}
              placeholder="输入新目录名称"
            />
            <button onClick={handleCreateDirectory}>创建</button>
            <button onClick={() => setIsCreatingNew(false)}>取消</button>
          </div>
        ) : (
          <button className="new-dir-btn" onClick={() => setIsCreatingNew(true)}>
            + 新建目录
          </button>
        )}

        <div className="modal-actions">
          <button onClick={handleSave} disabled={!selectedDirectory}>
            保存
          </button>
          <button onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
};

export default DirectoryModal;
