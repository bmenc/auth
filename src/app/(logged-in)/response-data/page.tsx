"use client";
import { useEffect, useState } from "react";
import { HTMLTable, Toast, Button } from "@blueprintjs/core";

interface ResponseDataItem {
  _id: string;
  entity: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters: string;
  response: string;
  auth: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ResponseDataPage() {
  const [data, setData] = useState<ResponseDataItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string, message: string, intent: 'success' | 'danger' }>>([]);
  
  const [formData, setFormData] = useState<Omit<ResponseDataItem, '_id' | 'createdAt' | 'updatedAt'>>({
    entity: "",
    description: "",
    method: 'GET',
    parameters: "",
    response: "",
    auth: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/response-data');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        addToast('Error loading data', 'danger');
      }
    } catch {
      addToast('Connection error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Response Data - Blueprint App";
    fetchData();
  }, []);

  const addToast = (message: string, intent: 'success' | 'danger') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, intent }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (item: ResponseDataItem) => {
    setEditingId(item._id);
    setFormData({
      entity: item.entity,
      description: item.description,
      method: item.method,
      parameters: item.parameters,
      response: item.response,
      auth: item.auth,
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      entity: "",
      description: "",
      method: 'GET',
      parameters: "",
      response: "",
      auth: false,
    });
  };

  const handleSave = async () => {
    if (!formData.entity || !formData.description || !formData.response) {
      addToast('Entity, description and response are required', 'danger');
      return;
    }
    setLoading(true);
    try {
      if (isCreating) {
        const response = await fetch('/api/response-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          addToast('Response data created successfully', 'success');
          setIsCreating(false);
          fetchData();
        } else {
          const result = await response.json();
          addToast(result.error || 'Error creating response data', 'danger');
        }
      } else if (editingId) {
        const response = await fetch(`/api/response-data/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          addToast('Response data updated successfully', 'success');
          setEditingId(null);
          fetchData();
        } else {
          const result = await response.json();
          addToast(result.error || 'Error updating response data', 'danger');
        }
      }
    } catch {
      addToast('Connection error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      entity: "",
      description: "",
      method: 'GET',
      parameters: "",
      response: "",
      auth: false,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this response data? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/response-data/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        addToast('Response data deleted successfully', 'success');
        fetchData();
      } else {
        const result = await response.json();
        addToast(result.error || 'Error deleting response data', 'danger');
      }
    } catch {
      addToast('Connection error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const renderEditableCell = (item: ResponseDataItem, field: keyof ResponseDataItem) => {
    const isEditing = editingId === item._id;
    if (isEditing) {
      if (field === 'method') {
        return (
          <select
            value={formData.method}
            onChange={(e) => handleInputChange('method', e.target.value)}
            className="bp4-input text-sm"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        );
      }
      if (field === 'auth') {
        return (
          <input
            type="checkbox"
            checked={formData.auth}
            onChange={(e) => handleInputChange('auth', e.target.checked)}
            className="bp4-checkbox"
          />
        );
      }
      if (field === 'response') {
        return (
          <textarea
            value={formData.response}
            onChange={(e) => handleInputChange('response', e.target.value)}
            className="bp4-input text-sm"
            rows={3}
            style={{ width: '100%', minWidth: '300px' }}
          />
        );
      }
      if (field === 'parameters') {
        return (
          <textarea
            value={formData.parameters}
            onChange={(e) => handleInputChange('parameters', e.target.value)}
            className="bp4-input text-sm"
            rows={2}
            style={{ width: '100%', minWidth: '200px' }}
          />
        );
      }
      return (
        <input
          type="text"
          value={formData[field as keyof typeof formData] as string}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="bp4-input text-sm"
          style={{ width: '100%', minWidth: '150px' }}
        />
      );
    }
    if (field === 'auth') {
      return <span className="text-gray-900 font-medium">{item.auth ? 'Yes' : 'No'}</span>;
    }
    if (field === 'response' || field === 'parameters') {
      const value = item[field] as string;
      const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
      return (
        <span className="text-gray-900 font-medium" title={value}>
          {displayValue}
        </span>
      );
    }
    return (
      <span className="text-gray-900 font-medium">
        {item[field] as string}
      </span>
    );
  };

  const renderCreateRow = () => {
    if (!isCreating) return null;
    return (
      <tr className="border-t border-gray-100 bg-blue-50/50">
        <td className="py-2">
          <input
            type="text"
            value={formData.entity}
            onChange={(e) => handleInputChange('entity', e.target.value)}
            className="bp4-input text-sm"
            placeholder="Entity"
            style={{ width: '100%', minWidth: '150px' }}
          />
        </td>
        <td className="py-2">
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="bp4-input text-sm"
            placeholder="Description"
            style={{ width: '100%', minWidth: '150px' }}
          />
        </td>
        <td className="py-2">
          <select
            value={formData.method}
            onChange={(e) => handleInputChange('method', e.target.value)}
            className="bp4-input text-sm"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </td>
        <td className="py-2">
          <textarea
            value={formData.parameters}
            onChange={(e) => handleInputChange('parameters', e.target.value)}
            className="bp4-input text-sm"
            placeholder="Parameters"
            rows={2}
            style={{ width: '100%', minWidth: '200px' }}
          />
        </td>
        <td className="py-2">
          <textarea
            value={formData.response}
            onChange={(e) => handleInputChange('response', e.target.value)}
            className="bp4-input text-sm"
            placeholder="Response"
            rows={3}
            style={{ width: '100%', minWidth: '300px' }}
          />
        </td>
        <td className="py-2">
          <input
            type="checkbox"
            checked={formData.auth}
            onChange={(e) => handleInputChange('auth', e.target.checked)}
            className="bp4-checkbox"
          />
        </td>
        <td className="py-2 text-right">
          <span 
            className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 mr-2"
            onClick={handleSave}
          >
            SAVE
          </span>
          <span 
            className="text-xs text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={handleCancel}
          >
            CANCEL
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Response Data</h1>
        {!isCreating && (
          <Button intent="primary" onClick={handleCreate}>
            Add New
          </Button>
        )}
      </div>
      <HTMLTable className="w-full" compact interactive>
        <thead>
          <tr className="bg-gray-100/25">
            <th className="text-left py-2">ENTITY</th>
            <th className="text-left py-2">DESCRIPTION</th>
            <th className="text-left py-2">METHOD</th>
            <th className="text-left py-2">PARAMETERS</th>
            <th className="text-left py-2">RESPONSE</th>
            <th className="text-left py-2">AUTH</th>
            <th className="text-right py-2 w-32">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {renderCreateRow()}
          {data.map((item) => (
            <tr key={item._id} className="border-t border-gray-100">
              <td className="py-2">
                {editingId === item._id ? renderEditableCell(item, 'entity') : (
                  <span className="text-gray-900 font-medium">{item.entity}</span>
                )}
              </td>
              <td className="py-2">
                {editingId === item._id ? renderEditableCell(item, 'description') : (
                  <span className="text-gray-900 font-medium">{item.description}</span>
                )}
              </td>
              <td className="py-2">
                {renderEditableCell(item, 'method')}
              </td>
              <td className="py-2">
                {renderEditableCell(item, 'parameters')}
              </td>
              <td className="py-2">
                {renderEditableCell(item, 'response')}
              </td>
              <td className="py-2">
                {renderEditableCell(item, 'auth')}
              </td>
              <td className="py-2 text-right">
                {editingId === item._id ? (
                  <>
                    <span 
                      className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 mr-2"
                      onClick={handleSave}
                    >
                      SAVE
                    </span>
                    <span 
                      className="text-xs text-gray-400 cursor-pointer hover:text-gray-600"
                      onClick={handleCancel}
                    >
                      CANCEL
                    </span>
                  </>
                ) : (
                  <>
                    <span 
                      className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 mr-2"
                      onClick={() => handleEdit(item)}
                    >
                      EDIT
                    </span>
                    <span 
                      className="text-xs text-red-400 cursor-pointer hover:text-red-600"
                      onClick={() => handleDelete(item._id)}
                    >
                      DEL
                    </span>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
      {data.length === 0 && !isCreating && !loading && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          No response data found. Click &quot;Add New&quot; to create one.
        </div>
      )}
      {loading && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          Processing...
        </div>
      )}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            intent={toast.intent}
            timeout={3000}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

