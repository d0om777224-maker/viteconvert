import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Server-side security configuration
const serverSecurityConfig = {
  fs: {
    // DENY access to all sensitive system paths
    deny: [
      // Windows System Files
      'C:\\Windows\\System32\\drivers\\etc\\hosts',
      'C:\\Windows\\System32\\config\\SAM',
      'C:\\Windows\\System32\\config\\SECURITY',
      'C:\\Windows\\System32\\config\\SOFTWARE',
      'C:\\Windows\\System32\\config\\SYSTEM',
      'C:\\Windows\\System32\\drivers\\etc\\services',
      'C:\\Windows\\System32\\drivers\\etc\\protocols',
      
      // macOS/Linux System Files
      '/etc/passwd',
      '/etc/shadow',
      '/etc/hosts',
      '/etc/group',
      '/etc/gshadow',
      '/etc/sudoers',
      '/etc/ssh/sshd_config',
      
      // Critical Application Files
      '/etc/ssl/certs/ca-certificates.crt',
      '/usr/local/share/ca-certificates',
      
      // System Configuration
      '/proc/meminfo',
      '/proc/cpuinfo',
      '/proc/version',
      
      // Development Tools
      '~/.ssh/id_rsa',
      '~/.ssh/id_ed25519',
      '~/.ssh/config',
      
      // Environment Files
      '.env',
      '.env.local',
      '.env.production',
      
      // Backup Files
      '*.bak',
      '*.backup',
      '*.old',
      
      // Temporary Files
      '/tmp/',
      '/var/tmp/',
      
      // Virtual Environment Paths
      'venv/',
      '.venv/',
      'env/',
      
      // Database Files
      '*.sql',
      '*.sqlite',
      '*.mdb',
      
      // Configuration Files
      'docker-compose.yml',
      'docker-compose.override.yml',
      'kubernetes.yaml',
      'kubecfg',
      
      // Credential Files
      'credentials.json',
      'token.json',
      'secret.key',
      'private.key'
    ],
    
    // ALLOW access to your project files
    allow: [
      './src',
      './public',
      './config.js',
      './README.md',
      './LICENSE',
      './package.json'
    ],
    
    // Additional Windows-specific protections
    strict: true,
    
    // Disable package.json allow list for better security
    packageJsonAllowList: false
  },
  
  // CSRF Protection
  csrf: {
    origin: true,
    key: 'csrf-secret-key-change-in-production'
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Request-ID']
  },
  
  // Server headers security
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'"
  }
}

export default defineConfig({
  plugins: [react()],
  server: serverSecurityConfig,
  
  // Build security hardening
  build: {
    rollupOptions: {
      external: ['crypto', 'fs', 'path', 'os']
    }
  },
  
  // Optimize dependency security scanning
  optimizeDeps: {
    force: true
  },
  
  // Preview server security
  preview: {
    port: 4173,
    strictPort: true
  }
})
