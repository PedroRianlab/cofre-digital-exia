import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.LOGIN_THROTTLE_LIMIT = '100';
process.env.REGISTER_THROTTLE_LIMIT = '100';
process.env.AUTH_THROTTLE_TTL_MS = '60000';
process.env.GLOBAL_THROTTLE_LIMIT = '1000';
process.env.GLOBAL_THROTTLE_TTL_MS = '60000';
process.env.STORAGE_DIR = join(tmpdir(), 'cofre-digital-e2e-unused');
process.env.MAX_UPLOAD_MB = '20';
process.env.UPLOAD_THROTTLE_LIMIT = '100';
process.env.UPLOAD_THROTTLE_TTL_MS = '60000';
