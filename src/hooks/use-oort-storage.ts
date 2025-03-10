/**
 * Re-export from OORT storage hooks
 * This maintains backward compatibility with existing imports
 */
import { useOortStorage } from './oort/use-oort-storage';
import { UploadResult } from '@/utils/oortStorage';

export { useOortStorage };
export type { UploadResult };
