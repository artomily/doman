/**
 * Sync Endpoint
 * POST /api/v1/sync
 *
 * Trigger external data sync (for cron jobs or manual trigger).
 * Requires CRON_SECRET for authentication.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { runAllSyncs, syncDefiLlama, syncScamSniffer, syncCryptoScamDB } from '@/services/sync-service';
import { CRON_SECRET } from '@/lib/constants';

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    // Verify cron secret
    if (!CRON_SECRET) {
      return errors.unauthorized('CRON_SECRET not configured');
    }
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== CRON_SECRET) {
      return errors.unauthorized('Invalid cron secret');
    }

    const body = await request.json();
    const source = body?.source || 'all';

    // Run sync based on source
    let result;
    switch (source) {
      case 'defillama':
        result = await syncDefiLlama();
        break;
      case 'scamsniffer':
        result = await syncScamSniffer();
        break;
      case 'cryptoscamdb':
        result = await syncCryptoScamDB();
        break;
      case 'all':
        const batchResult = await runAllSyncs();
        result = {
          success: true,
          source: 'all',
          recordsAdded: batchResult.totalAdded,
          recordsUpdated: batchResult.totalUpdated,
          syncLogId: 'batch-' + Date.now(),
          duration: batchResult.totalDuration,
        };
        break;
      default:
        return errors.validation('Invalid sync source', {
          validSources: ['defillama', 'scamsniffer', 'cryptoscamdb', 'all'],
        });
    }

    return apiSuccess(result);
  });
}
