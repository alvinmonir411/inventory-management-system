const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_9ByhcsjYMR7H@ep-square-paper-an5uie01-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function seed() {
  await client.connect();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);
  await client.query(`
    INSERT INTO users (email, "passwordHash", name, role, "isActive") 
    VALUES ('admin@example.com', $1, 'Admin User', 'ADMIN', true)
    ON CONFLICT (email) DO NOTHING
  `, [hash]);
  console.log('User created: admin@example.com / password123');
  await client.end();
}
seed().catch(console.error);
