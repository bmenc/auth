#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
function toggleAuth() {
    if (!fs.existsSync(envPath)) {
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
}
toggleAuth();
