import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Client, Product, Invoice, InvoiceItem } from '../types';
import { generateInvoiceNumber, calculateInvoiceTotal } from '../utils/calculations';
import { Plus, Trash2, Mic, MicOff, User, Package } from 'lucide-react';
import { startVoiceRecording, processVoiceCommand } from '../utils/voice';

const NewInvoice: React.FC = () => {
  const { state, dispatch } = useApp();
  const { clients, products, invoices, settings } = state;

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  // New client form
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
  });

  useEffect(() => {
    // Set default due date to 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].product_name = product.name;
        updatedItems[index].unit_price = product.price;
        updatedItems[index].total = updatedItems[index].quantity * product.price;
      }
    }
    
    setInvoiceItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleVoiceInput = async () => {
    if (!settings.elevenlabs_key) {
      alert('Please configure ElevenLabs API key in settings first');
      return;
    }

    setIsRecording(true);
    try {
      const transcript = await startVoiceRecording(settings.elevenlabs_key);
      const result = processVoiceCommand(transcript);
      
      // Process voice command results
      if (result.client) {
        let client = clients.find(c => c.name.toLowerCase().includes(result.client!.toLowerCase()));
        if (!client) {
          // Create new client
          client = {
            id: Date.now().toString(),
            name: result.client,
            email: '',
            created_at: new Date().toISOString(),
          };
          dispatch({ type: 'ADD_CLIENT', payload: client });
        }
        setSelectedClient(client);
      }

      if (result.amount && result.description) {
        const newItem: InvoiceItem = {
          id: Date.now().toString(),
          product_id: '',
          product_name: result.description,
          quantity: 1,
          unit_price: result.amount,
          total: result.amount,
        };
        setInvoiceItems([...invoiceItems, newItem]);
      }
    } catch (error) {
      console.error('Voice recognition error:', error);
      alert('Voice recognition failed. Please try again.');
    } finally {
      setIsRecording(false);
    }
  };

  const handleSaveInvoice = () => {
    if (!selectedClient || invoiceItems.length === 0) {
      alert('Please select a client and add at least one item');
      return;
    }

    const { subtotal, taxAmount, total } = calculateInvoiceTotal(invoiceItems, settings.tax_rate);
    
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoice_number: generateInvoiceNumber(invoices),
      client_id: selectedClient.id,
      client_name: selectedClient.name,
      client_email: selectedClient.email,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      items: invoiceItems,
      subtotal,
      tax_rate: settings.tax_rate,
      tax_amount: taxAmount,
      total,
      status: 'draft',
      notes,
      created_at: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_INVOICE', payload: newInvoice });
    
    // Save to localStorage
    const updatedInvoices = [...invoices, newInvoice];
    localStorage.setItem('invoicing-invoices', JSON.stringify(updatedInvoices));
    
    // Reset form
    setSelectedClient(null);
    setInvoiceItems([]);
    setNotes('');
    
    alert('Invoice saved successfully!');
  };

  const handleAddClient = () => {
    if (!newClient.name || !newClient.email) {
      alert('Please fill in client name and email');
      return;
    }

    const client: Client = {
      id: Date.now().toString(),
      ...newClient,
      created_at: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CLIENT', payload: client });
    
    // Save to localStorage
    const updatedClients = [...clients, client];
    localStorage.setItem('invoicing-clients', JSON.stringify(updatedClients));
    
    setSelectedClient(client);
    setNewClient({ name: '', email: '', phone: '', address: '' });
    setShowClientForm(false);
  };

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.price <= 0) {
      alert('Please fill in product name and price');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      ...newProduct,
      created_at: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_PRODUCT', payload: product });
    
    // Save to localStorage
    const updatedProducts = [...products, product];
    localStorage.setItem('invoicing-products', JSON.stringify(updatedProducts));
    
    setNewProduct({ name: '', description: '', price: 0, category: '' });
    setShowProductForm(false);
  };

  const { subtotal, taxAmount, total } = calculateInvoiceTotal(invoiceItems, settings.tax_rate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
          <p className="mt-2 text-sm text-gray-700">Create a new invoice for your client</p>
        </div>
        <button
          onClick={handleVoiceInput}
          disabled={isRecording}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Recording...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Voice Input
            </>
          )}
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        {/* Client Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Client
          </label>
          <div className="flex gap-2">
            <select
              value={selectedClient?.id || ''}
              onChange={(e) => {
                const client = clients.find(c => c.id === e.target.value);
                setSelectedClient(client || null);
              }}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowClientForm(!showClientForm)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Add Client Form */}
        {showClientForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Client Name *"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email *"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Address"
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowClientForm(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClient}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Add Client
              </button>
            </div>
          </div>
        )}

        {/* Due Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Invoice Items */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Invoice Items
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowProductForm(!showProductForm)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Package className="w-4 h-4" />
              </button>
              <button
                onClick={handleAddItem}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>
          </div>

          {/* Quick Add Product Form */}
          {showProductForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name *"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Price *"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setShowProductForm(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Add Product
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {invoiceItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="md:col-span-2">
                  <select
                    value={item.product_id}
                    onChange={(e) => handleUpdateItem(index, 'product_id', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select product or enter custom</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>
                  {!item.product_id && (
                    <input
                      type="text"
                      placeholder="Custom item name"
                      value={item.product_name}
                      onChange={(e) => handleUpdateItem(index, 'product_name', e.target.value)}
                      className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Unit Price"
                    value={item.unit_price}
                    onChange={(e) => handleUpdateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Additional notes for this invoice..."
          />
        </div>

        {/* Invoice Total */}
        {invoiceItems.length > 0 && (
          <div className="border-t pt-6">
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({(settings.tax_rate * 100).toFixed(1)}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveInvoice}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;