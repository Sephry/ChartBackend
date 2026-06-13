import { AppError } from '../errors.js';

let cachedAdmin = null;

async function getAppCheck() {
  if (!cachedAdmin) {
    const mod = await import('firebase-admin');
    const admin = mod.default ?? mod; // firebase-admin is CJS
    if (admin.apps.length === 0) admin.initializeApp();
    cachedAdmin = admin;
  }
  return cachedAdmin.appCheck();
}

// Pass-through unless APP_CHECK_ENFORCED=true. Ready to flip on with no other change.
export function createAppCheck(config) {
  return async function appCheck(req, res, next) {
    if (!config.appCheckEnforced) return next();

    const token = req.header('X-Firebase-AppCheck');
    if (!token) {
      return next(new AppError(401, 'APP_CHECK_FAILED', 'Missing App Check token.'));
    }
    try {
      await (await getAppCheck()).verifyToken(token);
      return next();
    } catch {
      return next(new AppError(401, 'APP_CHECK_FAILED', 'Invalid App Check token.'));
    }
  };
}
