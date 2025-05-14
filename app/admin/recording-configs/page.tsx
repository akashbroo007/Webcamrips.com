'use client';

import { useState, useEffect } from 'react';
import RecordingConfigForm from '@/app/components/admin/RecordingConfigForm';

export default function RecordingConfigsPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/recording-configs');
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const method = selectedConfig ? 'PUT' : 'POST';
      const url = '/api/recording-configs' + (selectedConfig ? `?id=${selectedConfig._id}` : '');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchConfigs();
        setSelectedConfig(null);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        const response = await fetch('/api/recording-configs', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          await fetchConfigs();
        }
      } catch (error) {
        console.error('Failed to delete config:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Recording Configurations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add/Edit Configuration</h2>
          <RecordingConfigForm
            initialData={selectedConfig}
            onSubmit={handleSubmit}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Configurations</h2>
          <div className="space-y-4">
            {configs.map((config) => (
              <div
                key={config._id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedConfig(config)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{config.modelName}</h3>
                    <p className="text-sm text-gray-600">{config.platform}</p>
                    <p className="text-sm text-gray-500">{config.streamUrl}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConfig(config);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(config._id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {config.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 