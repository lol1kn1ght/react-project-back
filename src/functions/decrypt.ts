import crypto from 'crypto-js';
import { hash_key } from '../config/constants.json';
import { Request, Response, NextFunction } from 'express';

type body_type = {
  encrypted_data: string;
};

export function decrypt(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as unknown as body_type;
  const bytes = crypto.AES.decrypt(
    body.encrypted_data as unknown as string,
    hash_key
  );
  const decryptedData = JSON.parse(bytes.toString(crypto.enc.Utf8));
  (req.body as object) = decryptedData;

  next();
}
