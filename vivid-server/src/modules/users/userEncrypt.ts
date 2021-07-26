import * as crypto from 'crypto';
const alg = 'aes-192-cbc';

const encrypt = (d: string, key: string): string => {
  const iv = crypto.randomBytes(16);
  const disgestedKey = crypto.scryptSync(key, 'salt', 24);
  const cipher = crypto.createCipheriv(alg, disgestedKey, iv);
  const encrypted = cipher.update(d, 'utf8', 'hex');
  return [
    encrypted + cipher.final('hex'),
    Buffer.from(iv).toString('hex'),
  ].join('|');
};

const decrypt = (d: string, key: string) => {
  const disgestedKey = crypto.scryptSync(key, 'salt', 24);
  const [encrypted, iv] = d.split('|');
  if (!iv) throw new Error('IV not found');
  const decipher = crypto.createDecipheriv(
    alg,
    disgestedKey,
    Buffer.from(iv, 'hex'),
  );
  const decrypted =
    decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  return JSON.parse(decrypted);
};

function generateKey(userId: string, secret: string) {
  // has random parts to make bruteforcing even harder, (even though its open source so it doesnt help)
  return `##${userId}-${secret}--`;
}

export function encryptUserData(
  userId: string,
  secret: string,
  data: any,
): string {
  const d = JSON.stringify(data);
  const key = generateKey(userId, secret);
  const encrypted = encrypt(d, key);
  return encrypted;
}

export function decryptUserData(
  userId: string,
  secret: string,
  data: string,
): any {
  const key = generateKey(userId, secret);
  const decrypted = decrypt(data, key);
  return decrypted;
}
