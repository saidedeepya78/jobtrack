import { STATUSES } from './constants.js';
import { isValidISODate, todayISO } from './format.js';

const MAX_TEXT_LENGTH = 120;
const MAX_URL_LENGTH = 500;

export function validateApplication(values, { today = todayISO() } = {}) {
  const errors = {};
  const company = String(values.company || '').trim();
  const role = String(values.role || '').trim();
  const jobUrl = String(values.jobUrl || '').trim();
  const applicationDate = String(values.applicationDate || '').trim();
  const status = String(values.status || '').trim();

  if (!company) {
    errors.company = 'Company name is required.';
  } else if (company.length > MAX_TEXT_LENGTH) {
    errors.company = `Company name must be ${MAX_TEXT_LENGTH} characters or fewer.`;
  }

  if (!role) {
    errors.role = 'Role title is required.';
  } else if (role.length > MAX_TEXT_LENGTH) {
    errors.role = `Role title must be ${MAX_TEXT_LENGTH} characters or fewer.`;
  }

  if (jobUrl) {
    if (jobUrl.length > MAX_URL_LENGTH) {
      errors.jobUrl = `Job URL must be ${MAX_URL_LENGTH} characters or fewer.`;
    } else {
      try {
        const parsed = new URL(jobUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          errors.jobUrl = 'Use a URL that starts with http:// or https://.';
        }
      } catch {
        errors.jobUrl = 'Enter a valid URL, including https://.';
      }
    }
  }

  if (!applicationDate) {
    errors.applicationDate = 'Application date is required.';
  } else if (!isValidISODate(applicationDate)) {
    errors.applicationDate = 'Enter a valid application date.';
  } else if (applicationDate > today) {
    errors.applicationDate = 'Application date cannot be in the future.';
  }

  if (!STATUSES.includes(status)) {
    errors.status = 'Choose a valid status.';
  }

  return errors;
}

export function normalizeApplication(values) {
  return {
    company: String(values.company || '').trim(),
    role: String(values.role || '').trim(),
    jobUrl: String(values.jobUrl || '').trim(),
    applicationDate: String(values.applicationDate || '').trim(),
    status: String(values.status || '').trim(),
  };
}
