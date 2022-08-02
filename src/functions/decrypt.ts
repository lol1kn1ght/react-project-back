import crypto from 'crypto-js';
import { hash_key } from '../config/constants.json';

export function decrypt<T extends object>(data: string): T | undefined {
  try {
    const bytes = crypto.AES.decrypt(data, hash_key);
    const decryptedData = JSON.parse(bytes.toString(crypto.enc.Utf8));

    return decryptedData;
  } catch (err) {
    return undefined;
  }
}
