"use client";
import { useState, useEffect, useCallback } from "react";
import { Button, Toast, Spinner } from "@blueprintjs/core";
import { useRouter, useParams } from "next/navigation";
import { ENTITY_OPTIONS } from "@/constants/entityOptions";

interface ResponseDataItem {
  _id: string;
  entity: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters: string;
  response: string;
  auth: boolean;
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  entity: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  description: string;
  parameters: string;
  response: string;
  auth: boolean;
}

export default function EditHemodilabPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toasts, setToasts] = useState<Array<{ id: string, message: string, intent: 'success' | 'danger' }>>([]);
  
  const [formData, setFormData] = useState<FormData>({
    entity: "",
    method: 'GET',
    url: "",
    description: "",
    parameters: "",
    response: "",
    auth: false,
  });

  const addToast = useCallback((message: string, intent: 'success' | 'danger') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, intent }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const response = await fetch('/api/response-data');
        if (response.ok) {
          const result: ResponseDataItem[] = await response.json();
          const item = result.find((item) => item._id === id);
          if (item) {
            setFormData({
              entity: item.entity,
              description: item.description,
              method: item.method,
              parameters: item.parameters,
              response: item.response,
              auth: item.auth,
              url: item.url || "",
            });
          } else {
            addToast('Response data not found', 'danger');
            router.push('/hemodilab');
          }
        } else {
          addToast('Error loading data', 'danger');
          router.push('/hemodilab');
        }
      } catch {
        addToast('Connection error', 'danger');
        router.push('/hemodilab');
      } finally {
        setFetching(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id, router, addToast]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.entity || !formData.description || !formData.response) {
      addToast('Entity, description and response are required', 'danger');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/response-data/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        addToast('Response data updated successfully', 'success');
        router.push('/hemodilab');
      } else {
        const result = await response.json();
        addToast(result.error || 'Error updating response data', 'danger');
      }
    } catch {
      addToast('Connection error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/hemodilab');
  };

  const renderField = (fieldName: string, fieldKey: keyof FormData) => {
    if (fieldKey === 'entity') {
      return (
        <select
          value={formData.entity || ''}
          onChange={(e) => handleInputChange('entity', e.target.value)}
          className="bp4-input text-sm"
          style={{ width: '100%', minWidth: '200px' }}
          autoFocus
        >
          <option value="">Select entity...</option>
          {ENTITY_OPTIONS.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </select>
      );
    }
    if (fieldKey === 'method') {
      return (
        <select
          value={formData.method}
          onChange={(e) => handleInputChange('method', e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE')}
          className="bp4-input text-sm"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      );
    }
    if (fieldKey === 'auth') {
      return (
        <input
          type="checkbox"
          checked={formData.auth}
          onChange={(e) => handleInputChange('auth', e.target.checked)}
          className="bp4-checkbox"
        />
      );
    }
    if (fieldKey === 'response') {
      return (
        <textarea
          value={formData.response}
          onChange={(e) => handleInputChange('response', e.target.value)}
          className="bp4-input text-sm"
          rows={5}
          style={{ width: '100%', minWidth: '300px' }}
          placeholder="Response"
        />
      );
    }
    if (fieldKey === 'parameters') {
      return (
        <textarea
          value={formData.parameters}
          onChange={(e) => handleInputChange('parameters', e.target.value)}
          className="bp4-input text-sm"
          rows={3}
          style={{ width: '100%', minWidth: '200px' }}
          placeholder="Parameters"
        />
      );
    }
    return (
      <input
        type="text"
        value={formData[fieldKey] as string}
        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
        className="bp4-input text-sm"
        style={{ width: '100%', minWidth: '200px' }}
        placeholder={fieldName}
      />
    );
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={50} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Response Data</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
            {renderField('Entity', 'entity')}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
            {renderField('Method', 'method')}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
            {renderField('URL', 'url')}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            {renderField('Description', 'description')}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parameters</label>
            {renderField('Parameters', 'parameters')}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response</label>
            {renderField('Response', 'response')}
          </div>
          
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 mr-3">Auth</label>
            {renderField('Auth', 'auth')}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button intent="primary" onClick={handleSave} loading={loading}>
            Save
          </Button>
        </div>
      </div>
      
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          intent={toast.intent}
          onDismiss={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}
    </div>
  );
}

