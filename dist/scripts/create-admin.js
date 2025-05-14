"use strict";
// Script to create an admin user
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../lib/utils/db");
const User_1 = __importDefault(require("../lib/models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env.local') });
// Create admin user
async function createAdmin() {
    try {
        // Connect to database
        console.log('Connecting to MongoDB...');
        await (0, db_1.connectDB)();
        console.log('Connected to MongoDB');
        // Default admin credentials
        const adminUsername = process.argv[2] || 'admin';
        const adminEmail = process.argv[3] || 'admin@example.com';
        const adminPassword = process.argv[4] || 'Admin123!';
        // Check if admin already exists
        const existingAdmin = await User_1.default.findOne({
            $or: [
                { email: adminEmail.toLowerCase() },
                { username: adminUsername }
            ]
        });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }
        // Create admin user
        const adminUser = new User_1.default({
            username: adminUsername,
            email: adminEmail.toLowerCase(),
            password: adminPassword, // Will be hashed by the pre-save hook
            isAdmin: true,
            isPremium: true,
        });
        // Save admin user to database
        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log(`Username: ${adminUsername}`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('\nYou can now log in with these credentials.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}
// Run the function
createAdmin();
