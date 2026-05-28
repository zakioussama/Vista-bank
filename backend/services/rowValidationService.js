const {
  isValidEmail,
  isValidPhone,
  isValidDate,
  isValidAccountNumber,
  isValidBalance,
  isValidEnum,
} = require('../utils/validators');
const { REQUIRED_FIELDS, ENUMS } = require('../config/bankingFields');

const validateMappedRow = (mapped, { seenEmails, seenAccounts } = {}) => {
  const errors = [];

  REQUIRED_FIELDS.forEach((field) => {
    if (!mapped[field]) errors.push(`Missing required field: ${field}`);
  });

  if (mapped.email) {
    if (!isValidEmail(mapped.email)) errors.push('Invalid email format');
    else if (seenEmails?.has(String(mapped.email).toLowerCase())) errors.push('Duplicate email');
  }

  if (mapped.phone_number && !isValidPhone(mapped.phone_number)) {
    errors.push('Phone number must contain only digits (min 8)');
  }

  const acctCheck = isValidAccountNumber(mapped.account_number, seenAccounts);
  if (!acctCheck.valid) errors.push(acctCheck.message);

  const balCheck = isValidBalance(mapped.balance);
  if (!balCheck.valid) errors.push(balCheck.message);

  if (mapped.currency) {
    const c = isValidEnum(mapped.currency, ENUMS.currency, 'Currency');
    if (!c.valid) errors.push(c.message);
  } else {
    errors.push('Currency is required');
  }

  if (mapped.account_status) {
    const s = isValidEnum(mapped.account_status, ENUMS.account_status, 'Account status');
    if (!s.valid) errors.push(s.message);
  } else {
    errors.push('Account status is required');
  }

  if (mapped.account_type) {
    const t = isValidEnum(mapped.account_type, ENUMS.account_type, 'Account type');
    if (!t.valid) errors.push(t.message);
  } else {
    errors.push('Account type is required');
  }

  if (mapped.created_at && !isValidDate(mapped.created_at)) {
    errors.push('Invalid created_at date');
  }

  return errors;
};

/** Normalize validated row values for database insert */
const normalizeMappedForInsert = (mapped) => {
  const out = { ...mapped };
  const bal = isValidBalance(mapped.balance);
  if (bal.valid) out.balance = bal.value;

  const c = isValidEnum(mapped.currency, ENUMS.currency, 'Currency');
  if (c.valid) out.currency = c.value.toUpperCase();

  const s = isValidEnum(mapped.account_status, ENUMS.account_status, 'Account status');
  if (s.valid) out.account_status = s.value;

  const t = isValidEnum(mapped.account_type, ENUMS.account_type, 'Account type');
  if (t.valid) out.account_type = t.value;

  if (out.phone_number) out.phone_number = String(out.phone_number).replace(/\D/g, '');
  if (out.account_number) out.account_number = String(out.account_number).trim();

  return out;
};

module.exports = { validateMappedRow, normalizeMappedForInsert };
