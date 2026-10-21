import { db } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

try {
  db.resetToSeed();
  logger.info('Database successfully seeded with Ethiopian universities, verified companies, students, and internships.');
  process.exit(0);
} catch (error) {
  logger.error('Database seed failed', { error: error.message });
  process.exit(1);
}
