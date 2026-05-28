const { ENUMS, ACCOUNT_NUMBER_LENGTH } = require('../config/bankingFields');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => EMAIL_REGEX.test(String(email || '').trim());

/** Phone: digits only, minimum 8 digits */
const isValidPhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15 && /^\d+$/.test(digits);
};

const isValidDate = (value) => {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};

const isValidAccountNumber = (accountNumber, seenSet = null) => {
  const val = String(accountNumber || '').trim();
  if (!val) return { valid: false, message: 'Account number is required' };
  if (!/^\d+$/.test(val)) return { valid: false, message: 'Account number must contain only digits' };
  if (val.length !== ACCOUNT_NUMBER_LENGTH) {
    return { valid: false, message: `Account number must be exactly ${ACCOUNT_NUMBER_LENGTH} digits` };
  }
  if (seenSet?.has(val)) return { valid: false, message: 'Duplicate account number' };
  return { valid: true };
};

const isValidBalance = (balance) => {
  if (balance === undefined || balance === null || balance === '') {
    return { valid: false, message: 'Balance is required' };
  }
  const num = Number(String(balance).replace(/,/g, ''));
  if (Number.isNaN(num)) return { valid: false, message: 'Balance must be numeric' };
  if (num < 0) return { valid: false, message: 'Balance cannot be negative' };
  return { valid: true, value: num };
};

const isValidEnum = (value, allowed, fieldLabel) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return { valid: false, message: `${fieldLabel} is required` };
  const match = allowed.find((a) => a.toLowerCase() === normalized);
  if (!match) {
    return { valid: false, message: `${fieldLabel} must be one of: ${allowed.join(', ')}` };
  }
  return { valid: true, value: match };
};

const normalizeEnumValue = (value, allowed) => {
  const normalized = String(value || '').trim().toLowerCase();
  return allowed.find((a) => a.toLowerCase() === normalized) || null;
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidDate,
  isValidAccountNumber,
  isValidBalance,
  isValidEnum,
  normalizeEnumValue,
  ENUMS,
  EMAIL_REGEX,
};
