require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';

// Set up test Supabase configuration
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-test-project.supabase.co';
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || 'your-test-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'your-test-service-role-key';

// Set up test JWT configuration
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h'; 