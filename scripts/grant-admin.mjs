#!/usr/bin/env node
import 'dotenv/config';
import { getApps, initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const REQUIRED_CONFIRMATION = 'I_UNDERSTAND_THIS_GRANTS_PRODUCTION_ACCESS';

function parseArgs(argv) {
  const args = { positional: [], flags: new Map() };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token.startsWith('--')) {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args.flags.set(token, 'true');
      } else {
        args.flags.set(token, next);
        i += 1;
      }
      continue;
    }

    args.positional.push(token);
  }

  return args;
}

function getFlag(args, key, fallback = undefined) {
  return args.flags.has(key) ? args.flags.get(key) : fallback;
}

function printUsage() {
  console.log(`\nSecure admin bootstrap utility\n\nUsage:\n  node scripts/grant-admin.mjs grant --uid <uid> --email <email> --confirm ${REQUIRED_CONFIRMATION}\n  node scripts/grant-admin.mjs revoke --uid <uid> --confirm ${REQUIRED_CONFIRMATION}\n  node scripts/grant-admin.mjs migrate --confirm ${REQUIRED_CONFIRMATION}\n\nOptions:\n  --uid <uid>                Firebase Auth UID to modify\n  --email <email>            Expected institutional email for grant\n  --allow-non-neu true       Allow grant for non @neu.edu.ph email (default false)\n  --confirm <text>           Required guard text to avoid accidental execution\n\nEnvironment:\n  NEXT_PUBLIC_FIREBASE_PROJECT_ID or GOOGLE_CLOUD_PROJECT\n  Optional: FIREBASE_SERVICE_ACCOUNT_JSON with raw JSON credentials\n  Optional: GOOGLE_APPLICATION_CREDENTIALS for application default credentials\n`);
}

function assertConfirmation(args) {
  const confirmation = getFlag(args, '--confirm', '');
  if (confirmation !== REQUIRED_CONFIRMATION) {
    throw new Error(`Missing valid confirmation. Re-run with --confirm ${REQUIRED_CONFIRMATION}`);
  }
}

function initializeAdmin() {
  if (getApps().length > 0) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    const parsed = JSON.parse(serviceAccountJson);
    initializeApp({ credential: cert(parsed) });
    return;
  }

  initializeApp({ credential: applicationDefault() });
}

async function grantAdmin(args) {
  assertConfirmation(args);

  const uid = getFlag(args, '--uid');
  const email = (getFlag(args, '--email') || '').toLowerCase().trim();
  const allowNonNeu = getFlag(args, '--allow-non-neu', 'false') === 'true';

  if (!uid) {
    throw new Error('Missing required --uid argument.');
  }
  if (!email) {
    throw new Error('Missing required --email argument.');
  }
  if (!allowNonNeu && !email.endsWith('@neu.edu.ph')) {
    throw new Error('Refusing grant: email must end with @neu.edu.ph. Use --allow-non-neu true to override.');
  }

  const auth = getAuth();
  const db = getFirestore();

  const userRecord = await auth.getUser(uid);
  const existingClaims = userRecord.customClaims || {};
  await auth.setCustomUserClaims(uid, { ...existingClaims, admin: true });

  const batch = db.batch();
  batch.set(db.doc(`users/${uid}`), {
    id: uid,
    email,
    role: 'ADMIN',
    canEdit: true,
    isBlocked: false,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  batch.set(db.doc(`roles_admin/${uid}`), {
    uid,
    email,
    grantedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  await batch.commit();

  console.log(`Admin grant completed for UID: ${uid}`);
  console.log('Ask the user to sign out and sign back in to refresh auth token claims.');
}

async function revokeAdmin(args) {
  assertConfirmation(args);

  const uid = getFlag(args, '--uid');
  if (!uid) {
    throw new Error('Missing required --uid argument.');
  }

  const auth = getAuth();
  const db = getFirestore();

  const userRecord = await auth.getUser(uid);
  const existingClaims = userRecord.customClaims || {};
  const { admin, ...claimsWithoutAdmin } = existingClaims;
  void admin;

  await auth.setCustomUserClaims(uid, claimsWithoutAdmin);

  const batch = db.batch();
  batch.set(db.doc(`users/${uid}`), {
    role: 'STUDENT',
    canEdit: false,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  batch.delete(db.doc(`roles_admin/${uid}`));
  await batch.commit();

  console.log(`Admin access revoked for UID: ${uid}`);
  console.log('Ask the user to sign out and sign back in to refresh auth token claims.');
}

async function migrateExistingAdmins(args) {
  assertConfirmation(args);

  const auth = getAuth();
  const db = getFirestore();

  const snapshot = await db.collection('roles_admin').get();
  let migrated = 0;

  for (const docSnap of snapshot.docs) {
    const uid = docSnap.id;
    const data = docSnap.data();
    const email = typeof data.email === 'string' ? data.email.toLowerCase() : '';

    const userRecord = await auth.getUser(uid);
    const existingClaims = userRecord.customClaims || {};
    if (existingClaims.admin === true) {
      continue;
    }

    await auth.setCustomUserClaims(uid, { ...existingClaims, admin: true });
    await db.doc(`users/${uid}`).set({
      role: 'ADMIN',
      canEdit: true,
      email: email || userRecord.email || null,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    migrated += 1;
  }

  console.log(`Migration complete. Updated claims for ${migrated} admin account(s).`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args.positional[0];

  if (!command || command === 'help' || command === '--help') {
    printUsage();
    return;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    throw new Error('Missing project id. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID or GOOGLE_CLOUD_PROJECT.');
  }

  initializeAdmin();

  if (command === 'grant') {
    await grantAdmin(args);
    return;
  }

  if (command === 'revoke') {
    await revokeAdmin(args);
    return;
  }

  if (command === 'migrate') {
    await migrateExistingAdmins(args);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
