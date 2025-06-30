import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Client, Product, Invoice, Settings, DashboardStats } from '../types';

interface AppState {
  clients: Client[];
  products: Product[];
  invoices: Invoice[];
  settings: Settings;
  stats: DashboardStats;
  loading: boolean;
}

type AppAction =
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: Invoice }
  | { type: 'DELETE_INVOICE'; payload: string }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_STATS'; payload: DashboardStats }
  | { type: 'SET_LOADING'; payload: boolean };

const initialSettings: Settings = {
  tax_rate: 0.15,
  business_name: 'Your Business',
  business_email: 'contact@yourbusiness.com',
  elevenlabs_key: 'sk_ad94a9fbdb71b3867152c1f8a9b08aaa8c90b3d0ac60763b',
  supabase_url: 'https://fjoolfvcbjkffnbjxxig.supabase.co',
  supabase_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqb29sZnZjYmprZmZuYmp4eGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTQwODcsImV4cCI6MjA2Njg3MDA4N30.5K7232KNx3YDEFtIwurB4Nanzl9ityDLfv2DEasv5Xc',
};

const initialStats: DashboardStats = {
  total_revenue: 0,
  pending_amount: 0,
  paid_invoices: 0,
  pending_invoices: 0,
  top_products: [],
  monthly_revenue: [],
};

const initialState: AppState = {
  clients: [],
  products: [],
  invoices: [],
  settings: initialSettings,
  stats: initialStats,
  loading: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload };
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id ? action.payload : client
        ),
      };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload),
      };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
      };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] };
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(invoice =>
          invoice.id === action.payload.id ? action.payload : invoice
        ),
      };
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter(invoice => invoice.id !== action.payload),
      };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('invoicing-settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      // Ensure the API keys and URL are set if not already saved
      if (!parsedSettings.elevenlabs_key) {
        parsedSettings.elevenlabs_key = 'sk_ad94a9fbdb71b3867152c1f8a9b08aaa8c90b3d0ac60763b';
      }
      if (!parsedSettings.supabase_url) {
        parsedSettings.supabase_url = 'https://fjoolfvcbjkffnbjxxig.supabase.co';
      }
      if (!parsedSettings.supabase_key) {
        parsedSettings.supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqb29sZnZjYmprZmZuYmp4eGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTQwODcsImV4cCI6MjA2Njg3MDA4N30.5K7232KNx3YDEFtIwurB4Nanzl9ityDLfv2DEasv5Xc';
      }
      dispatch({ type: 'SET_SETTINGS', payload: parsedSettings });
    }

    // Load data from localStorage initially
    const savedClients = localStorage.getItem('invoicing-clients');
    const savedProducts = localStorage.getItem('invoicing-products');
    const savedInvoices = localStorage.getItem('invoicing-invoices');

    if (savedClients) {
      dispatch({ type: 'SET_CLIENTS', payload: JSON.parse(savedClients) });
    }
    if (savedProducts) {
      dispatch({ type: 'SET_PRODUCTS', payload: JSON.parse(savedProducts) });
    }
    if (savedInvoices) {
      dispatch({ type: 'SET_INVOICES', payload: JSON.parse(savedInvoices) });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};