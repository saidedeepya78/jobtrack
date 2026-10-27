import { createClient } from '@supabase/supabase-js';
import { STATUSES } from './constants.js';
import { todayISO } from './format.js';
import { createSampleApplications } from './samples.js';

const STORAGE_KEY = 'jobtrack.applications.v1';

function getSupabaseConfig() {
  const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const isPlaceholder = (value) =>
    !value ||
    /your-project-ref|your-anon-public-key|your-anon-key|your-public-key|replace-me/i.test(value);

  return {
    url,
    anonKey,
    configured:
      /^https?:\/\//i.test(url) &&
      anonKey.length >= 20 &&
      !isPlaceholder(url) &&
      !isPlaceholder(anonKey),
  };
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sortApplications(applications) {
  return [...applications].sort((a, b) => {
    const dateComparison = String(b.applicationDate || '').localeCompare(
      String(a.applicationDate || ''),
    );
    if (dateComparison !== 0) return dateComparison;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}

function cleanBusinessFields(values) {
  return {
    company: String(values.company || '').trim(),
    role: String(values.role || '').trim(),
    jobUrl: String(values.jobUrl || '').trim(),
    applicationDate: String(values.applicationDate || '').trim(),
    status: String(values.status || '').trim(),
  };
}

function materializeSamples(baseDate = new Date()) {
  const now = Date.now();
  return createSampleApplications(baseDate).map((sample, index) => ({
    ...sample,
    id: createId(),
    createdAt: new Date(now - index * 1000).toISOString(),
  }));
}

function getBrowserStorage() {
  try {
    return window.localStorage;
  } catch {
    throw new Error(
      'This browser is blocking localStorage. Enable site storage or connect Supabase to continue.',
    );
  }
}

function readLocalData() {
  const storage = getBrowserStorage();
  let raw;

  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    throw new Error(
      'This browser is blocking localStorage. Enable site storage or connect Supabase to continue.',
    );
  }

  if (raw === null) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Stored data is not an array.');
    return parsed.map(normalizeStoredRecord).filter(Boolean);
  } catch {
    // Keep a copy of unreadable data rather than silently discarding it.
    try {
      storage.setItem(`${STORAGE_KEY}.corrupt-${Date.now()}`, raw);
    } catch {
      // Ignore backup failures and start with fresh demo data.
    }
    return null;
  }
}

function normalizeStoredRecord(record) {
  if (!record || typeof record !== 'object' || !record.id || !record.company || !record.role) {
    return null;
  }

  return {
    id: String(record.id),
    company: String(record.company),
    role: String(record.role),
    jobUrl: typeof record.jobUrl === 'string' ? record.jobUrl : '',
    applicationDate:
      typeof record.applicationDate === 'string' ? record.applicationDate : todayISO(),
    status: STATUSES.includes(record.status) ? record.status : 'Applied',
    isSample: Boolean(record.isSample),
    createdAt:
      typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
  };
}

function writeLocalData(applications) {
  const storage = getBrowserStorage();
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch {
    throw new Error(
      'Could not save to localStorage. It may be full or blocked by your browser.',
    );
  }
}

function ensureLocalData() {
  const existing = readLocalData();
  if (existing !== null) return existing;

  const samples = materializeSamples();
  writeLocalData(samples);
  return samples;
}

function createLocalStore() {
  return {
    kind: 'local',

    async list() {
      return sortApplications(ensureLocalData()).map((application) => ({ ...application }));
    },

    async create(values) {
      const data = ensureLocalData();
      const application = {
        ...cleanBusinessFields(values),
        id: createId(),
        isSample: false,
        createdAt: new Date().toISOString(),
      };

      writeLocalData([...data, application]);
      return { ...application };
    },

    async update(id, values) {
      const data = ensureLocalData();
      const index = data.findIndex((application) => application.id === id);

      if (index === -1) {
        throw new Error('That application no longer exists. Refresh and try again.');
      }

      const updated = {
        ...data[index],
        ...cleanBusinessFields(values),
        id: data[index].id,
        isSample: data[index].isSample,
        createdAt: data[index].createdAt,
      };

      const next = [...data];
      next[index] = updated;
      writeLocalData(next);
      return { ...updated };
    },

    async remove(id) {
      const data = ensureLocalData();
      writeLocalData(data.filter((application) => application.id !== id));
    },

    async addSamples() {
      const data = ensureLocalData();
      if (data.some((application) => application.isSample)) return [];

      const samples = materializeSamples();
      writeLocalData([...data, ...samples]);
      return samples.map((application) => ({ ...application }));
    },

    async removeSamples() {
      const data = ensureLocalData();
      const remaining = data.filter((application) => !application.isSample);
      writeLocalData(remaining);
      return data.length - remaining.length;
    },
  };
}

function databaseErrorMessage(error) {
  const message =
    error?.message || error?.details || error?.hint || 'Unknown database error.';

  if (/could not find the table|relation .* does not exist|schema cache/i.test(message)) {
    return "The 'applications' table was not found. Run supabase/schema.sql in your Supabase SQL Editor.";
  }
  if (/invalid api key|jwt|apikey|unauthorized/i.test(message)) {
    return 'Supabase rejected the API key. Check VITE_SUPABASE_ANON_KEY, then restart or redeploy.';
  }
  if (/row-level security|permission denied/i.test(message)) {
    return 'Supabase blocked this request. Check the RLS policies in supabase/schema.sql.';
  }
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(message)) {
    return 'Could not reach Supabase. Check the project URL, internet connection, and browser extensions.';
  }
  return message;
}

function databaseError(error) {
  return new Error(databaseErrorMessage(error));
}

function rowToApplication(row) {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    jobUrl: row.job_url || '',
    applicationDate: row.application_date,
    status: row.status,
    isSample: Boolean(row.is_sample),
    createdAt: row.created_at,
  };
}

function businessFieldsToRow(values) {
  const fields = cleanBusinessFields(values);
  return {
    company: fields.company,
    role: fields.role,
    job_url: fields.jobUrl || null,
    application_date: fields.applicationDate,
    status: fields.status,
  };
}

function createSupabaseStore(supabase) {
  return {
    kind: 'supabase',

    async list() {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('application_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw databaseError(error);
      return (data || []).map(rowToApplication);
    },

    async create(values) {
      const { data, error } = await supabase
        .from('applications')
        .insert({ ...businessFieldsToRow(values), is_sample: false })
        .select()
        .single();

      if (error) throw databaseError(error);
      return rowToApplication(data);
    },

    async update(id, values) {
      const { data, error } = await supabase
        .from('applications')
        .update(businessFieldsToRow(values))
        .eq('id', id)
        .select()
        .single();

      if (error) throw databaseError(error);
      return rowToApplication(data);
    },

    async remove(id) {
      const { error } = await supabase.from('applications').delete().eq('id', id);
      if (error) throw databaseError(error);
    },

    async addSamples() {
      const { count, error: countError } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('is_sample', true);

      if (countError) throw databaseError(countError);
      if ((count || 0) > 0) return [];

      const rows = createSampleApplications().map((sample) => ({
        ...businessFieldsToRow(sample),
        is_sample: true,
      }));

      const { data, error } = await supabase.from('applications').insert(rows).select();
      if (error) throw databaseError(error);
      return (data || []).map(rowToApplication);
    },

    async removeSamples() {
      const { data, error } = await supabase
        .from('applications')
        .delete()
        .eq('is_sample', true)
        .select('id');

      if (error) throw databaseError(error);
      return (data || []).length;
    },
  };
}

/**
 * Checks for a usable Supabase connection first. If credentials are missing or
 * the database cannot be reached, the app stays fully functional with a clearly
 * labeled localStorage demo store.
 */
export async function initDataStore() {
  const config = getSupabaseConfig();

  if (!config.configured) {
    return {
      store: createLocalStore(),
      mode: 'local',
      fallback: false,
      error: null,
    };
  }

  try {
    const supabase = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { error } = await supabase.from('applications').select('id').limit(1);
    if (error) throw error;

    return {
      store: createSupabaseStore(supabase),
      mode: 'supabase',
      fallback: false,
      error: null,
    };
  } catch (error) {
    console.warn('[JobTrack] Supabase unavailable; using localStorage demo fallback.', error);
    return {
      store: createLocalStore(),
      mode: 'local',
      fallback: true,
      error: databaseErrorMessage(error),
    };
  }
}
