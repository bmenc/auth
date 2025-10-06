#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

function toggleAuth() {
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const currentAuth = envContent.includes('AUTH=true');
    const newAuth = !currentAuth;
    
    const newEnvContent = envContent.replace(
        /AUTH=(true|false)/,
        `AUTH=${newAuth}`
    );
    
    fs.writeFileSync(envPath, newEnvContent);
    
    console.log(`✅ Auth mode changed to: ${newAuth ? 'MongoDB (Real)' : 'Demo'}`);
    console.log(`📝 Updated .env file`);
    console.log(`🔄 Restart your development server to apply changes`);
}

toggleAuth();
