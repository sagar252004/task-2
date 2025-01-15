
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kvgkgmroclnilrjwuoum.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2tnbXJvY2xuaWxyand1b3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NDY4NjIsImV4cCI6MjA1MjQyMjg2Mn0.dMrvKSAXzHIUnkD6VfyAWadaN_zhcMT-Az2JykXfRBs'
export const supabase = createClient(supabaseUrl, supabaseKey)