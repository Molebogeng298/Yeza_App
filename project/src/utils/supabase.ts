import { createClient } from '@supabase/supabase-js';
import { Client, Product, Invoice } from '../types';

let supabaseClient: any = null;

export const initializeSupabase = (url: string, key: string) => {
  supabaseClient = createClient(url, key);
  return supabaseClient;
};

export const getSupabaseClient = () => {
  return supabaseClient;
};

// Client operations
export const syncClientsToSupabase = async (clients: Client[]) => {
  if (!supabaseClient) return;
  
  try {
    const { error } = await supabaseClient
      .from('clients')
      .upsert(clients, { onConflict: 'id' });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error syncing clients:', error);
  }
};

export const loadClientsFromSupabase = async (): Promise<Client[]> => {
  if (!supabaseClient) return [];
  
  try {
    const { data, error } = await supabaseClient
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading clients:', error);
    return [];
  }
};

// Product operations
export const syncProductsToSupabase = async (products: Product[]) => {
  if (!supabaseClient) return;
  
  try {
    const { error } = await supabaseClient
      .from('products')
      .upsert(products, { onConflict: 'id' });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error syncing products:', error);
  }
};

export const loadProductsFromSupabase = async (): Promise<Product[]> => {
  if (!supabaseClient) return [];
  
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

// Invoice operations
export const syncInvoicesToSupabase = async (invoices: Invoice[]) => {
  if (!supabaseClient) return;
  
  try {
    const { error } = await supabaseClient
      .from('invoices')
      .upsert(invoices, { onConflict: 'id' });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error syncing invoices:', error);
  }
};

export const loadInvoicesFromSupabase = async (): Promise<Invoice[]> => {
  if (!supabaseClient) return [];
  
  try {
    const { data, error } = await supabaseClient
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading invoices:', error);
    return [];
  }
};