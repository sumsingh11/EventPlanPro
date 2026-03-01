/**
 * clearDatabase.mjs
 * Deletes ALL documents from every EventPlanPro Firestore collection.
 * Run once for a fresh start:  node scripts/clearDatabase.mjs
 *
 * ⚠️  IRREVERSIBLE — back up any data you need first.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// ── 1.  Point this at your service-account JSON ─────────────────────────────
//  Download from Firebase Console → Project Settings → Service Accounts →
//  "Generate new private key"  and save as scripts/serviceAccount.json
import serviceAccount from './serviceAccount.json' assert { type: 'json' };

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── 2.  Collections to wipe ──────────────────────────────────────────────────
const COLLECTIONS = [
    'events',
    'guests',
    'tasks',
    'taskComments',
    'budgets',
    'expenses',
    'announcements',
    'media',
    'notifications',
];

async function deleteCollection(name) {
    const ref = db.collection(name);
    const snapshot = await ref.get();
    if (snapshot.empty) {
        console.log(`  ${name}: already empty`);
        return;
    }
    // Batch delete in chunks of 400
    const chunks = [];
    let batch = db.batch();
    let count = 0;
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        count++;
        if (count === 400) {
            chunks.push(batch.commit());
            batch = db.batch();
            count = 0;
        }
    });
    if (count > 0) chunks.push(batch.commit());
    await Promise.all(chunks);
    console.log(`  ✅ ${name}: ${snapshot.size} documents deleted`);
}

async function main() {
    console.log('\n🗑️  EventPlanPro — Database Cleanup\n');
    console.log('⚠️  This will permanently delete all data. Ctrl+C to abort.\n');
    // Give 3 seconds to abort
    await new Promise(r => setTimeout(r, 3000));

    for (const col of COLLECTIONS) {
        await deleteCollection(col);
    }

    console.log('\n✅  All collections cleared. Database is clean.\n');
    process.exit(0);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
