import { ObjectId } from 'bson';
import crypto from 'crypto';

export function hashObjectId(data: string): ObjectId {
    const hash = crypto.createHash('md5').update(data).digest('hex');
    const buffer = Buffer.from(hash.substring(0, 24), 'hex');
    return new ObjectId(buffer);
}
