/**
 * CLOVER DIGITAL - Supabase Configuration
 * Client initialization for database operations
 */

const SUPABASE_URL = 'https://sctwathlvhzhekmbtaat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHdhdGhsdmh6aGVrbWJ0YWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NzEwMTAsImV4cCI6MjA5NjU0NzAxMH0.3yM_FEtyuZoXNnl43ZQ56M5d3gzsxgBzgegouHKHrA8';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
