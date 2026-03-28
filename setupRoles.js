const mongoose = require('mongoose');
const roleModel = require('./schemas/roles');

async function setupRoles() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/NNPTUD-C6');
        console.log('✓ Connected to MongoDB');

        // Check if roles exist
        const userRole = await roleModel.findOne({ name: 'user' });
        const adminRole = await roleModel.findOne({ name: 'admin' });

        // Create user role if not exists
        if (!userRole) {
            const newUserRole = new roleModel({
                name: 'user',
                description: 'Regular user role'
            });
            await newUserRole.save();
            console.log('✓ Created "user" role');
        } else {
            console.log('✓ "user" role already exists');
        }

        // Create admin role if not exists
        if (!adminRole) {
            const newAdminRole = new roleModel({
                name: 'admin',
                description: 'Administrator role'
            });
            await newAdminRole.save();
            console.log('✓ Created "admin" role');
        } else {
            console.log('✓ "admin" role already exists');
        }

        // Show all roles
        const allRoles = await roleModel.find();
        console.log('\n--- All Roles ---');
        allRoles.forEach((role, idx) => {
            console.log(`${idx + 1}. ${role.name} (ID: ${role._id})`);
        });

        await mongoose.connection.close();
        console.log('\n✓ Setup completed!');

    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    }
}

setupRoles();
