"use client";
import { useEffect, useState } from "react";
import { HTMLTable, Toast } from "@blueprintjs/core";
import { useSession, signOut } from "next-auth/react";
interface UserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string, message: string, intent: 'success' | 'danger' }>>([]);
  useEffect(() => {
    document.title = "Settings - Blueprint App";
  }, []);
  useEffect(() => {
    if (session?.user) {
      setUserData(prev => {
        const newName = session.user?.name || "";
        const newEmail = session.user?.email || "";
        if (prev.name !== newName || prev.email !== newEmail) {
          return {
            ...prev,
            name: newName,
            email: newEmail,
            password: "",
            confirmPassword: ""
          };
        }
        return prev;
      });
    }
  }, [session]);
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
  const handleEdit = (field: string) => {
    setEditingField(field);
  };
  const handleSaveEdit = async () => {
    if (!editingField) return;
    setLoading(true);
    try {
      if (editingField === 'password' && userData.password !== userData.confirmPassword) {
        addToast('Passwords do not match', 'danger');
        setLoading(false);
        return;
      }
      if (editingField === 'password' && userData.password.length < 6) {
        addToast('Password must be at least 6 characters', 'danger');
        setLoading(false);
        return;
      }
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: editingField,
          value: editingField === 'password' ? userData.password : userData[editingField as keyof UserData]
        }),
      });
      const result = await response.json();
      if (response.ok) {
        if (editingField === 'name' || editingField === 'email') {
          await update();
        }
        if (editingField === 'password') {
          setUserData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        }
        
        if (editingField === 'name') {
          addToast('Name updated successfully', 'success');
        } else if (editingField === 'email') {
          addToast('Email updated successfully', 'success');
        } else if (editingField === 'password') {
          addToast('Password updated successfully', 'success');
        }
        
        setEditingField(null);
      } else {
        addToast(result.error || 'Error updating settings', 'danger');
      }
    } catch {
      addToast('Connection error', 'danger');
    } finally {
      setLoading(false);
    }
  };
  const handleCancelEdit = () => {
    setEditingField(null);
    if (editingField === 'password') {
      setUserData(prev => ({ ...prev, password: "", confirmPassword: "" }));
    }
  };
  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });
      if (response.ok) {
        await signOut({ callbackUrl: '/sign-in' });
      } else {
        const result = await response.json();
        addToast(result.error || 'Error deleting account', 'danger');
      }
    } catch {
      addToast('Connection error', 'danger');
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };
  const renderEditableCell = (field: string, value: string, type: string = 'text') => {
    if (editingField === field) {
      return (
        <div className="flex flex-col gap-1">
          <input
            type={type}
            value={userData[field as keyof UserData]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (field === 'password') {
                  if (userData.password && userData.confirmPassword) {
                    handleSaveEdit();
                  }
                } else {
                  handleSaveEdit();
                }
              }
              if (e.key === 'Escape') handleCancelEdit();
            }}
            onBlur={() => {
              if (field !== 'password') {
                handleSaveEdit();
              }
            }}
            className="bp4-input text-sm"
            autoFocus
            placeholder={field === 'password' ? 'New password' : ''}
          />
          {field === 'password' && (
            <input
              type="password"
              value={userData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              onBlur={handleSaveEdit}
              className="bp4-input text-sm"
              placeholder="Confirm password"
            />
          )}
        </div>
      );
    }
    return (
      <span className="text-gray-900 font-medium">
        {field === 'password' ? '••••••••' : userData[field as keyof UserData]}
      </span>
    );
  };
  return (
    <div className="w-full">
      <HTMLTable className="w-full" compact interactive>
        <thead>
          <tr className="bg-gray-100/25">
            <th className="text-left py-2">FIELD</th>
            <th className="text-left py-2">VALUE</th>
            <th className="text-right py-2 w-24">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-gray-100">
            <td className="py-2 text-gray-600 text-sm">Name</td>
            <td className="py-2">
              {renderEditableCell('name', userData.name)}
            </td>
            <td className="py-2 text-right">
              <span 
                className="text-xs text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={() => handleEdit('name')}
              >
                EDIT
              </span>
            </td>
          </tr>
          <tr className="border-t border-gray-100">
            <td className="py-2 text-gray-600 text-sm">Email</td>
            <td className="py-2">
              {renderEditableCell('email', userData.email, 'email')}
            </td>
            <td className="py-2 text-right">
              <span 
                className="text-xs text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={() => handleEdit('email')}
              >
                EDIT
              </span>
            </td>
          </tr>
          <tr className="border-t border-gray-100">
            <td className="py-2 text-gray-600 text-sm">Password</td>
            <td className="py-2">
              {renderEditableCell('password', userData.password, 'password')}
            </td>
            <td className="py-2 text-right">
              <span 
                className="text-xs text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={() => handleEdit('password')}
              >
                EDIT
              </span>
            </td>
          </tr>
          <tr className="border-t border-gray-100">
            <td className="py-2 text-gray-600 text-sm">Delete Account</td>
            <td className="py-2 text-gray-500 text-sm">
              This action cannot be undone
            </td>
            <td className="py-2 text-right">
              <span 
                className="text-xs text-red-400 cursor-pointer hover:text-red-600"
                onClick={handleDeleteUser}
              >
                DEL
              </span>
            </td>
          </tr>
        </tbody>
      </HTMLTable>
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
