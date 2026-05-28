require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Mapping } = require('../models');
const { DEFAULT_VALUE_MAPPINGS } = require('../services/mappingTransformService');

const seed = async () => {
  try {
    await sequelize.sync({ alter: true });

    const [admin] = await User.findOrCreate({
      where: { email: 'admin@vistabank.com' },
      defaults: {
        name: 'System Admin',
        password: await bcrypt.hash('Admin@123', 12),
        role: 'admin',
      },
    });

    await User.findOrCreate({
      where: { email: 'operator@vistabank.com' },
      defaults: {
        name: 'Migration Operator',
        password: await bcrypt.hash('Operator@123', 12),
        role: 'operator',
      },
    });

    await Mapping.findOrCreate({
      where: { name: 'Banking CSV Direct Mapping' },
      defaults: {
        description: 'Identity mapping for new banking CSV schema with legacy code transforms',
        mapping_config: {
          legacy_id: 'id',
          migration_id: 'migration_id',
          customer_id: 'customer_id',
          first_name: 'first_name',
          last_name: 'last_name',
          email: 'email',
          phone_number: 'phone_number',
          account_number: 'account_number',
          account_type: 'account_type',
          balance: 'balance',
          currency: 'currency',
          branch_code: 'branch_code',
          account_status: 'account_status',
          created_at: 'created_at',
        },
        value_mappings: DEFAULT_VALUE_MAPPINGS,
        user_id: admin.id,
        is_default: true,
      },
    });

    console.log('Seed completed:');
    console.log('  Admin:    admin@vistabank.com / Admin@123');
    console.log('  Operator: operator@vistabank.com / Operator@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
