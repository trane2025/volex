import { SignJWT, jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET не задан');
}

const jwtKey = new TextEncoder().encode(jwtSecret);

export const createAccessToken = async (userId: number): Promise<string> => {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime('20m')
    .sign(jwtKey);
};

export const verifyAccessToken = async (token: string): Promise<number> => {
  const { payload } = await jwtVerify(token, jwtKey, {
    algorithms: ['HS256'],
    requiredClaims: ['sub', 'iat', 'exp'],
  });

  const userId = Number(payload.sub);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error('Некорректный id пользователя');
  }

  return userId;
};
