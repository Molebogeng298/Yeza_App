import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { initializeSupabase } from '../utils/supabase';
import { Settings as SettingsType } from '../types';
import { Save, Database, Mic, Building } from 'lucide-react';

const Settings: React.FC = () => {
  const { state, dispatch } = useApp();
  const { settings } = state;

  const [formData, setFormData] = useState<SettingsType>(settings);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    setFormData(settings);
    
    // Check if Supabase is connected
    if (settings.supabase_url && settings.supabase_key) {
      try {
        initializeSupabase(settings.supabase_url, settings.supabase_key);
        setSupabaseConnected(true);
      } catch (error) {
        setSupabaseConnected(false);
      }
    }
  }, [settings]);

  const handleSave = () => {
    dispatch({ type: 'SET_SETTINGS', payload: formData });
    localStorage.setItem('invoicing-settings', JSON.stringify(formData));
    
    // Initialize Supabase if credentials are provided
    if (formData.supabase_url && formData.supabase_key) {
      try {
        initializeSupabase(formData.supabase_url, formData.supabase_key);
        setSupabaseConnected(true);
      } catch (error) {
        setSupabaseConnected(false);
        alert('Failed to connect to Supabase. Please check your credentials.');
      }
    }
    
    alert('Settings saved successfully!');
  };

  const testSupabaseConnection = async () => {
    if (!formData.supabase_url || !formData.supabase_key) {
      alert('Please enter Supabase URL and API key first');
      return;
    }

    try {
      const client = initializeSupabase(formData.supabase_url, formData.supabase_key);
      const { data, error } = await client.from('clients').select('count', { count: 'exact' });
      
      if (error) {
        console.error('Supabase test error:', error);
        setSupabaseConnected(false);
        alert('Connection failed. Please check your credentials and database setup.');
      } else {
        setSupabaseConnected(true);
        alert('Successfully connected to Supabase!');
      }
    } catch (error) {
      console.error('Supabase connection error:', error);
      setSupabaseConnected(false);
      alert('Connection failed. Please check your credentials.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Configure your business information and integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Business Information */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Building className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Business Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Email
              </label>
              <input
                type="email"
                value={formData.business_email}
                onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <textarea
                value={formData.business_address || ''}
                onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.tax_rate * 100}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) / 100 || 0 })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Supabase Integration */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Supabase Integration</h2>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${supabaseConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm ${supabaseConnected ? 'text-green-600' : 'text-red-600'}`}>
                {supabaseConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supabase URL
              </label>
              <input
                type="url"
                value={formData.supabase_url || ''}
                onChange={(e) => setFormData({ ...formData, supabase_url: e.target.value })}
                placeholder="https://your-project.supabase.co"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supabase Anon Key
              </label>
              <input
                type="password"
                value={formData.supabase_key || ''}
                onChange={(e) => setFormData({ ...formData, supabase_key: e.target.value })}
                placeholder="Your Supabase anon key"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={testSupabaseConnection}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Test Connection
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You'll need to create tables in your Supabase database:
              <br />• clients (id, name, email, phone, address, created_at)
              <br />• products (id, name, description, price, category, created_at)  
              <br />• invoices (id, invoice_number, client_id, client_name, client_email, issue_date, due_date, items, subtotal, tax_rate, tax_amount, total, status, notes, created_at)
            </p>
          </div>
        </div>

        {/* ElevenLabs Integration */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Mic className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">ElevenLabs Voice Integration</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ElevenLabs API Key
              </label>
              <input
                type="password"
                value={formData.elevenlabs_key || ''}
                onChange={(e) => setFormData({ ...formData, elevenlabs_key: e.target.value })}
                placeholder="Your ElevenLabs API key"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Currently using browser's built-in speech recognition. 
              ElevenLabs integration can be added for more advanced voice processing.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;