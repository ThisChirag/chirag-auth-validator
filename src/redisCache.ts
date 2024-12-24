import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (error) => {
  console.log(`Redis Client Error: `, error);
});

export const connectReddis = async () => {
  await redisClient.connect();
};

export const storeToken = async (
  user_Id: string,
  token: string,
  ttl: number,
): Promise<boolean> => {
  try {
    await redisClient.set(`user:${user_Id}`, token, { EX: ttl });
    return true;
  } catch (error) {
    console.log('Error storing the token: ', error);
    return false;
  }
};

export const getTokenFromUser_Id = async (
  user_Id: string,
): Promise<string | null> => {
  try {
    return await redisClient.get(`user:${user_Id}`);
  } catch (error) {
    console.log('Error fecthing token from redis:', error);
    return null;
  }
};

export const setNewToken = async (
  user_id: string,
  token: string,
  ttl: number,
): Promise<boolean> => {
  try {
    await redisClient.del(`user:${user_id}`);
    await redisClient.set(`user:${user_id}`, token, { EX: ttl });
    return true;
  } catch (error) {
    console.log('Error in refreshing new token', error);
    return false;
  }
};

export const deleteCurrentToken = async (user_id: string): Promise<boolean> => {
  try {
    await redisClient.del(`user:${user_id}`);
    return true;
  } catch (error) {
    console.log('Error in deleting current token', error);
    return false;
  }
};

export const setOtp = async (key: string, otp: string, ttl: number) => {
  await redisClient.setEx(key, ttl, otp);
};

export const getOtp = async (key: string): Promise<string | null> => {
  return await redisClient.get(key);
};

export const deleteKey = async (key: string): Promise<number> => {
  return await redisClient.del(key);
};
