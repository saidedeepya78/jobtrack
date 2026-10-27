import { shiftDateISO } from './format.js';

/**
 * Demo records used in localStorage demo mode and by the "Load sample records"
 * action. Every record carries isSample: true so the UI can label it clearly.
 */
export function createSampleApplications(baseDate = new Date()) {
  return [
    {
      company: 'Nimbus Labs',
      role: 'Frontend Developer Intern',
      jobUrl: 'https://example.com/jobs/nimbus-frontend-intern',
      applicationDate: shiftDateISO(-6, baseDate),
      status: 'Interview',
      isSample: true,
    },
    {
      company: 'BrightPath Analytics',
      role: 'Data Analyst Intern',
      jobUrl: 'https://example.com/jobs/brightpath-data-analyst',
      applicationDate: shiftDateISO(-3, baseDate),
      status: 'Applied',
      isSample: true,
    },
    {
      company: 'Apex Software',
      role: 'Junior Software Engineer',
      jobUrl: 'https://example.com/jobs/apex-junior-engineer',
      applicationDate: shiftDateISO(-24, baseDate),
      status: 'Offer',
      isSample: true,
    },
    {
      company: 'DataForge',
      role: 'Product Design Intern',
      jobUrl: 'https://example.com/jobs/dataforge-product-design',
      applicationDate: shiftDateISO(-31, baseDate),
      status: 'Rejected',
      isSample: true,
    },
    {
      company: 'Cloudline',
      role: 'Cloud Engineer Intern',
      jobUrl: 'https://example.com/jobs/cloudline-cloud-engineer',
      applicationDate: shiftDateISO(-14, baseDate),
      status: 'Applied',
      isSample: true,
    },
  ];
}
