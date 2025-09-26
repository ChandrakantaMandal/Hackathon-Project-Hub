#!/usr/bin/env node

/**
 * Simple script to help clear rate limits in development
 * This script can be run to reset rate limiting
 */

console.log('🔄 Rate limit reset helper');
console.log('📝 To reset rate limits:');
console.log('1. Stop the server (Ctrl+C)');
console.log('2. Wait 5 seconds');
console.log('3. Restart the server (npm run server)');
console.log('');
console.log('💡 Alternative: Wait 15 minutes for rate limits to naturally reset');
console.log('⏰ Current time:', new Date().toLocaleString());
console.log('⏰ Rate limits will reset at:', new Date(Date.now() + 15 * 60 * 1000).toLocaleString());

