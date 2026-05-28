/** Platform target fields for banking customer/account migration */
const TARGET_FIELDS = [
  'legacy_id',
  'migration_id',
  'customer_id',
  'first_name',
  'last_name',
  'email',
  'phone_number',
  'account_number',
  'account_type',
  'balance',
  'currency',
  'branch_code',
  'account_status',
  'created_at',
];

const REQUIRED_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone_number',
  'account_number',
];

const ENUMS = {
  currency: ['MAD', 'USD', 'EUR'],
  account_status: ['active', 'frozen', 'closed'],
  account_type: ['savings', 'current', 'business', 'checking'],
};

/** Default legacy code → platform value transforms */
const DEFAULT_VALUE_MAPPINGS = {
  account_type: {
    CHK: 'checking',
    CHECKING: 'checking',
    SVG: 'savings',
    SAV: 'savings',
    SAVINGS: 'savings',
    BUS: 'business',
    BUSINESS: 'business',
    CUR: 'current',
    CURRENT: 'current',
  },
  account_status: {
    ACT: 'active',
    ACTIVE: 'active',
    FRZ: 'frozen',
    FROZEN: 'frozen',
    CLS: 'closed',
    CLOSED: 'closed',
  },
  currency: {
    DH: 'MAD',
    MAD: 'MAD',
    USD: 'USD',
    EUR: 'EUR',
    '$': 'USD',
    '€': 'EUR',
  },
};

const ACCOUNT_NUMBER_LENGTH = 12;

module.exports = {
  TARGET_FIELDS,
  REQUIRED_FIELDS,
  ENUMS,
  DEFAULT_VALUE_MAPPINGS,
  ACCOUNT_NUMBER_LENGTH,
};
