import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Client, Product } from '../types';
import { Plus, Edit, Trash2, Users, Package } from 'lucide-react';

const Management: React.FC = () => {
  const { state, dispatch } = useApp();
  const { clients, products } = state;
  
  const [activeTab, setActiveTab] = useState<'clients' | 'products'>('clients');
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
  });

  const resetClientForm = () => {
    setClientForm({ name: '', email: '', phone: '', address: '' });
    setEditingClient(null);
    setShowClientForm(false);
  };

  const resetProductForm = () => {
    setProductForm({ name: '', description: '', price: 0, category: '' });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleSaveClient = () => {
    if (!clientForm.name || !clientForm.email) {
      alert('Please fill in client name and email');
      return;
    }

    if (editingClient) {
      const updatedClient: Client = {
        ...editingClient,
        ...clientForm,
      };
      dispatch({ type: 'UPDATE_CLIENT', payload: updatedClient });
      
      const updatedClients = clients.map(c => c.id === editingClient.id ? updatedClient : c);
      localStorage.setItem('invoicing-clients', JSON.stringify(updatedClients));
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        ...clientForm,
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_CLIENT', payload: newClient });
      
      const updatedClients = [...clients, newClient];
      localStorage.setItem('invoicing-clients', JSON.stringify(updatedClients));
    }

    resetClientForm();
  };

  const handleSaveProduct = () => {
    if (!productForm.name || productForm.price <= 0) {
      alert('Please fill in product name and price');
      return;
    }

    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        ...productForm,
      };
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      
      const updatedProducts = products.map(p => p.id === editingProduct.id ? updatedProduct : p);
      localStorage.setItem('invoicing-products', JSON.stringify(updatedProducts));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        ...productForm,
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      
      const updatedProducts = [...products, newProduct];
      localStorage.setItem('invoicing-products', JSON.stringify(updatedProducts));
    }

    resetProductForm();
  };

  const handleEditClient = (client: Client) => {
    setClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
    });
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      dispatch({ type: 'DELETE_CLIENT', payload: id });
      const updatedClients = clients.filter(c => c.id !== id);
      localStorage.setItem('invoicing-clients', JSON.stringify(updatedClients));
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
      const updatedProducts = products.filter(p => p.id !== id);
      localStorage.setItem('invoicing-products', JSON.stringify(updatedProducts));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients & Products</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage your clients and products for faster invoice creation.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('clients')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'clients'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Clients ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Products ({products.length})
          </button>
        </nav>
      </div>

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Clients</h2>
            <button
              onClick={() => setShowClientForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </button>
          </div>

          {/* Client Form */}
          {showClientForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Client Name *"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={resetClientForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClient}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {editingClient ? 'Update' : 'Add'} Client
                </button>
              </div>
            </div>
          )}

          {/* Clients List */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {clients.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                        {client.phone && (
                          <p className="text-sm text-gray-500">{client.phone}</p>
                        )}
                        {client.address && (
                          <p className="text-sm text-gray-500">{client.address}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClient(client)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No clients yet</p>
                <p className="text-xs text-gray-400 mt-1">Add your first client to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Products</h2>
            <button
              onClick={() => setShowProductForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>

          {/* Product Form */}
          {showProductForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name *"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Price *"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={resetProductForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
              </div>
            </div>
          )}

          {/* Products List */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {products.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {products.map((product) => (
                  <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                        <p className="text-lg font-semibold text-green-600">${product.price.toFixed(2)}</p>
                        {product.description && (
                          <p className="text-sm text-gray-500">{product.description}</p>
                        )}
                        {product.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                            {product.category}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No products yet</p>
                <p className="text-xs text-gray-400 mt-1">Add your first product to get started</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Management;