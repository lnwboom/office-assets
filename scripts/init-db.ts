import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

console.log('Connecting to MongoDB...');
console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//<username>:<password>@'));

async function initializeDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        // Import models
        const { default: User } = await import('../src/models/User.js');
        const { default: Asset } = await import('../src/models/Asset.js');

        // Create initial admin user
        const existingAdmin = await User.findOne({ username: 'admin' });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 12);
            const adminUser = await User.create({
                username: 'admin',
                password: hashedPassword,
                fullName: 'System Administrator',
                email: 'admin@example.com',
                department: 'IT',
                role: 'ADMIN' as const,
                status: 'ACTIVE' as const,
            });

            console.log('Admin user created successfully:', adminUser.username);
        } else {
            console.log('Admin user already exists');
        }

        // Create sample assets
        const existingAssets = await Asset.countDocuments();

        if (existingAssets === 0) {
            const sampleAssets = [
                {
                    code: 'LT001',
                    name: 'Dell Laptop XPS 13',
                    type: 'Laptop',
                    status: 'IN_USE' as const,
                    purchaseDate: new Date('2023-01-15'),
                    receivedDate: new Date('2023-01-16'),
                    description: 'High-end developer laptop',
                    location: 'IT Department',
                    condition: 'EXCELLENT' as const
                },
                {
                    code: 'LT002',
                    name: 'MacBook Pro 14"',
                    type: 'Laptop',
                    status: 'IN_USE' as const,
                    purchaseDate: new Date('2023-03-01'),
                    receivedDate: new Date('2023-03-02'),
                    description: 'Design team laptop with M2 chip',
                    location: 'Design Department',
                    condition: 'EXCELLENT' as const
                },
                {
                    code: 'LT003',
                    name: 'Lenovo ThinkPad X1',
                    type: 'Laptop',
                    status: 'MAINTENANCE' as const,
                    purchaseDate: new Date('2022-11-15'),
                    receivedDate: new Date('2022-11-16'),
                    description: 'Business laptop for management',
                    location: 'Maintenance',
                    condition: 'FAIR' as const
                },
                {
                    code: 'MON001',
                    name: 'Dell 27" Monitor',
                    type: 'Monitor',
                    status: 'AVAILABLE' as const,
                    purchaseDate: new Date('2023-02-20'),
                    receivedDate: new Date('2023-02-21'),
                    description: '4K Monitor for design team',
                    location: 'Design Department',
                    condition: 'GOOD' as const
                },
                {
                    code: 'MON002',
                    name: 'LG 32" UltraFine',
                    type: 'Monitor',
                    status: 'IN_USE' as const,
                    purchaseDate: new Date('2023-04-15'),
                    receivedDate: new Date('2023-04-16'),
                    description: '5K Monitor for video editing',
                    location: 'Media Room',
                    condition: 'EXCELLENT' as const
                },
                {
                    code: 'KB001',
                    name: 'Logitech MX Keys',
                    type: 'Keyboard',
                    status: 'BROKEN' as const,
                    purchaseDate: new Date('2023-03-10'),
                    receivedDate: new Date('2023-03-11'),
                    description: 'Wireless mechanical keyboard',
                    location: 'Storage',
                    condition: 'POOR' as const
                },
                {
                    code: 'KB002',
                    name: 'Keychron K2',
                    type: 'Keyboard',
                    status: 'IN_USE' as const,
                    purchaseDate: new Date('2023-05-01'),
                    receivedDate: new Date('2023-05-02'),
                    description: 'Mechanical keyboard with brown switches',
                    location: 'IT Department',
                    condition: 'GOOD' as const
                },
                {
                    code: 'MS001',
                    name: 'Logitech MX Master 3',
                    type: 'Mouse',
                    status: 'IN_USE' as const,
                    purchaseDate: new Date('2023-02-15'),
                    receivedDate: new Date('2023-02-16'),
                    description: 'Wireless ergonomic mouse',
                    location: 'IT Department',
                    condition: 'GOOD' as const
                },
                {
                    code: 'PR001',
                    name: 'HP LaserJet Pro',
                    type: 'Printer',
                    status: 'IN_USE' as const,
                    purchaseDate: new Date('2023-01-20'),
                    receivedDate: new Date('2023-01-21'),
                    description: 'Color laser printer',
                    location: 'Office Floor 1',
                    condition: 'GOOD' as const
                },
                {
                    code: 'CAM001',
                    name: 'Logitech Brio',
                    type: 'Webcam',
                    status: 'AVAILABLE' as const,
                    purchaseDate: new Date('2023-06-01'),
                    receivedDate: new Date('2023-06-02'),
                    description: '4K webcam for video conferencing',
                    location: 'IT Storage',
                    condition: 'EXCELLENT' as const
                }
            ];

            await Asset.insertMany(sampleAssets);
            console.log('Sample assets created successfully');
        } else {
            console.log('Assets already exist in the database');
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
    }
}

// Run the initialization
initializeDatabase()
    .then(() => {
        console.log('Database initialization process completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Database initialization failed:');
        console.error(error);
        process.exit(1);
    });
