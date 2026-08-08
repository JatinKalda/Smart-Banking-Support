const mysql = require('mysql2/promise');

async function addRoleColumn() {
    let connection;
    try {
        console.log('🔧 Setting up database roles...');
        
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'hsbc_user',
            password: 'hsbc123',
            database: 'hsbc_bank'
        });

        // Add role column if not exists
        console.log('📝 Checking if role column exists...');
        const checkColumn = await connection.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='role'"
        );

        if (checkColumn[0].length === 0) {
            console.log('➕ Adding role column...');
            await connection.query(
                "ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' AFTER password"
            );
            console.log('✅ Role column added successfully');
        } else {
            console.log('✅ Role column already exists');
        }

        // Get all users ordered by createdAt
        const [users] = await connection.query(
            "SELECT id, firstName, email FROM users ORDER BY createdAt ASC"
        );

        console.log('\n👥 Assigning roles to users:');
        console.log('━'.repeat(50));

        // Assign roles: first = admin, second = user, rest = user
        for (let i = 0; i < users.length; i++) {
            const role = i === 0 ? 'admin' : 'user';
            const user = users[i];

            await connection.query(
                "UPDATE users SET role = ? WHERE id = ?",
                [role, user.id]
            );

            console.log(`✅ ${user.firstName} (${user.email}) → ${role.toUpperCase()}`);
        }

        console.log('━'.repeat(50));
        console.log('\n✅ All roles assigned successfully!\n');

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (connection) await connection.end();
        process.exit(1);
    }
}

// Run the migration
addRoleColumn();
