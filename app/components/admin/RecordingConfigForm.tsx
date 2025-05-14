'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface RecordingConfigFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function RecordingConfigForm({ initialData, onSubmit }: RecordingConfigFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach(key => {
        setValue(key, initialData[key]);
      });
    }
  }, [initialData, setValue]);

  const onSubmitForm = async (data: any) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Model Name</label>
        <input
          type="text"
          {...register('modelName', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.modelName && <span className="text-red-500">Model name is required</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Platform</label>
        <select
          {...register('platform', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="stripchat">Stripchat</option>
          <option value="chaturbate">Chaturbate</option>
          <option value="youtube">YouTube</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Stream URL</label>
        <input
          type="text"
          {...register('streamUrl', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.streamUrl && <span className="text-red-500">Stream URL is required</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Recording Quality</label>
        <select
          {...register('recordingQuality')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="auto">Auto</option>
          <option value="best">Best</option>
          <option value="worst">Worst</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cloud Storage Provider</label>
        <select
          {...register('cloudStorage.provider', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="s3">Amazon S3</option>
          <option value="gcs">Google Cloud Storage</option>
          <option value="azure">Azure Blob Storage</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bucket/Container</label>
        <input
          type="text"
          {...register('cloudStorage.bucket', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Storage Path</label>
        <input
          type="text"
          {...register('cloudStorage.path', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">Active</label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isLoading ? 'Saving...' : 'Save Configuration'}
      </button>
    </form>
  );
} 