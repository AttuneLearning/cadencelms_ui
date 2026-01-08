# Offline Sync Process

This module manages background synchronization between local IndexedDB storage and the backend API.

## Features

- **Auto-sync**: Automatically syncs data at configurable intervals
- **Online detection**: Syncs when device comes back online
- **Visibility sync**: Syncs when page becomes visible
- **Background sync**: Uses Service Worker Background Sync API when available
- **Error handling**: Gracefully handles sync failures and retries

## Usage

### Basic Usage

```typescript
import { useOfflineSync } from '@/processes/offline-sync';

function MyComponent() {
  const { status, isOnline, performSync } = useOfflineSync({
    autoSyncInterval: 60000, // 1 minute
    syncOnOnline: true,
    syncOnMount: true,
  });

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      {status.isRunning && <p>Syncing...</p>}
      <button onClick={performSync}>Sync Now</button>
    </div>
  );
}
```

### With Callbacks

```typescript
const { status } = useOfflineSync({
  onSyncStart: () => console.log('Sync started'),
  onSyncComplete: (result) => {
    if (result.success) {
      console.log('Sync completed successfully');
    } else {
      console.error('Sync failed:', result.error);
    }
  },
});
```

### Manual Sync Control

```typescript
const { performSync, startAutoSync, stopAutoSync } = useOfflineSync({
  autoSyncInterval: 0, // Disable auto-sync
});

// Trigger sync manually
await performSync();

// Start/stop auto-sync
startAutoSync();
stopAutoSync();
```

## Configuration

### OfflineSyncConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoSyncInterval` | `number` | `60000` | Auto-sync interval in milliseconds |
| `syncOnOnline` | `boolean` | `true` | Sync when device comes online |
| `syncOnVisibility` | `boolean` | `true` | Sync when page becomes visible |
| `syncOnMount` | `boolean` | `true` | Sync on component mount |
| `onSyncStart` | `() => void` | - | Callback when sync starts |
| `onSyncComplete` | `(result) => void` | - | Callback when sync completes |

## Sync Status

The `status` object provides the following information:

```typescript
interface SyncStatus {
  isRunning: boolean;        // Whether sync is currently running
  lastSyncAt: number | null; // Timestamp of last sync
  nextSyncAt: number | null; // Timestamp of next scheduled sync
  error: string | null;      // Last sync error (if any)
  syncCount: number;         // Total number of syncs performed
}
```

## Background Sync

The offline sync process also registers a Service Worker Background Sync handler that automatically syncs data when the device comes back online, even if the app is closed.

### Initialize Background Sync

```typescript
import { initOfflineSync } from '@/processes/offline-sync';

// Initialize during app startup
await initOfflineSync();
```

## Architecture

The offline sync process follows this flow:

1. **Push local changes**: Upload any dirty (modified) entities to the server
2. **Pull server data**: Download latest data from the server
3. **Process sync queue**: Execute any queued mutations from offline operations

### Sync Engine

The sync engine is responsible for coordinating data synchronization:

```typescript
import { getSyncEngine } from '@/shared/lib/storage';

const syncEngine = getSyncEngine();

// Perform full sync
await syncEngine.fullSync();

// Download specific course
await syncEngine.downloadCourse('course-id');

// Queue mutation for later
await syncEngine.queueMutation('UPDATE', 'course', 'course-id', { title: 'New Title' });
```

## Error Handling

Sync errors are captured and stored in the sync status. Failed sync queue entries are marked as failed and can be retried later.

```typescript
const { status } = useOfflineSync({
  onSyncComplete: (result) => {
    if (!result.success) {
      console.error('Sync failed:', result.error);
      // Show error notification to user
    }
  },
});
```

## Testing

Tests are available in `src/shared/lib/storage/sync.test.ts`.

```bash
npm test sync.test.ts
```

## Related

- [Storage Module](../../shared/lib/storage/README.md)
- [Online Status Hook](../../shared/hooks/useOnlineStatus.ts)
- [Service Worker](../../../public/service-worker.js)
