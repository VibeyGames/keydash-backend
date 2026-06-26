// Run this once to generate your password hash:
// node generate-password.js yourpassword
const bcrypt = require('bcryptjs');
const password = process.argv[2];
if (!password) { console.log('Usage: node generate-password.js yourpassword'); process.exit(1); }
bcrypt.hash(password, 12).then(hash => {
  console.log('\nYour password hash (paste this as DASHBOARD_PASSWORD_HASH in Railway):\n');
  console.log(hash);
  console.log('');
});
