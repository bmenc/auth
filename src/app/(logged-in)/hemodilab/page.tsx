"use client";
import { useEffect, useState, useCallback } from "react";
import { HTMLTable, Toast, Button, Collapse, Icon } from "@blueprintjs/core";
import { useRouter } from "next/navigation";
import React from "react";

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

export default function HemodilabPage() {
  const router = useRouter();
  const [data, setData] = useState<ResponseDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string, message: string, intent: 'success' | 'danger' }>>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const addToast = useCallback((message: string, intent: 'success' | 'danger') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, intent }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/response-data');
      if (response.ok) {
        const result = await response.json();
        // Ordenar alfabéticamente por entity
        const sorted = result.sort((a: ResponseDataItem, b: ResponseDataItem) => 
          a.entity.localeCompare(b.entity)
        );
        setData(sorted);
      } else {
        addToast('Error loading data', 'danger');
      }
    } catch {
      addToast('Connection error', 'danger');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    document.title = "HEMODILAB - Blueprint App";
    fetchData();
  }, [fetchData]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
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

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleEdit = (id: string) => {
    router.push(`/hemodilab/${id}/edit`);
  };

  const handleCreate = () => {
    router.push('/hemodilab/create');
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">HEMODILAB</h1>
        <Button intent="primary" onClick={handleCreate}>
          Add New
        </Button>
      </div>
      <HTMLTable className="w-full" compact interactive>
        <thead>
          <tr className="bg-gray-100/25">
            <th className="text-left py-2">ENTITY</th>
            <th className="text-left py-2">METHOD</th>
            <th className="text-left py-2">URL</th>
            <th className="text-left py-2">DESCRIPTION</th>
            <th className="text-right py-2 w-24">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const isExpanded = expandedIds.has(item._id);
            const rowSpan = isExpanded ? 5 : 1;

            return (
              <React.Fragment key={item._id}>
                <tr className="border-t border-gray-100">
                  <td className="py-2 text-gray-900 font-medium">
                    {item.entity}
                  </td>
                  <td className="py-2 text-gray-900 font-medium">
                    {item.method}
                  </td>
                  <td className="py-2 text-gray-900 font-medium">
                    {item.url || ''}
                  </td>
                  <td className="py-2 text-gray-900 font-medium">
                    {item.description}
                  </td>
                  <td className="py-2 text-right" rowSpan={rowSpan}>
                    <div className="flex">
                      <span 
                        className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 mr-2"
                        onClick={() => toggleExpand(item._id)}
                      >
                        <Icon icon={isExpanded ? "chevron-up" : "chevron-down"} className="inline" />
                      </span>
                      <span 
                        className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 mr-2"
                        onClick={() => handleEdit(item._id)}
                      >
                        EDIT
                      </span>
                      <span 
                        className="text-xs text-red-400 cursor-pointer hover:text-red-600"
                        onClick={() => handleDelete(item._id)}
                      >
                        DEL
                      </span>
                    </div>
                  </td>
                </tr>
                <tr key={`${item._id}-collapse`}>
                  <td colSpan={4} className="p-0">
                    <Collapse isOpen={isExpanded}>
                      <div className="pl-4">
                        <HTMLTable className="w-full" compact>
                          <tbody>
                            <tr className="border-t border-gray-100">
                              <td className="py-2 text-gray-600 text-sm w-32">Parameters</td>
                              <td className="py-2">
                                <span className="text-gray-900 font-medium">
                                  {item.parameters && item.parameters.length > 50
                                    ? item.parameters.substring(0, 50) + '...'
                                    : item.parameters || ''}
                                </span>
                              </td>
                            </tr>
                            <tr className="border-t border-gray-100">
                              <td className="py-2 text-gray-600 text-sm w-32">Response</td>
                              <td className="py-2">
                                <span className="text-gray-900 font-medium">
                                  {item.response && item.response.length > 50
                                    ? item.response.substring(0, 50) + '...'
                                    : item.response || ''}
                                </span>
                              </td>
                            </tr>
                            <tr className="border-t border-gray-100">
                              <td className="py-2 text-gray-600 text-sm w-32">Auth</td>
                              <td className="py-2">
                                <span className="text-gray-900 font-medium">{item.auth ? 'Yes' : 'No'}</span>
                              </td>
                            </tr>
                          </tbody>
                        </HTMLTable>
                      </div>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </HTMLTable>
      {data.length === 0 && !loading && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          No response data found. Click &quot;Add New&quot; to create one.
        </div>
      )}
      {loading && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          Loading...
        </div>
      )}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          intent={toast.intent}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
