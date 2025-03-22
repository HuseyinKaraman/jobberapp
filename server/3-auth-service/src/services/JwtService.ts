import jwt from 'jsonwebtoken';
import { config } from '../config';

class JwtService {
    private readonly secretKey: string;

    constructor() {
        this.secretKey = config.JWT_TOKEN!;
    }

    async generate(payload: any): Promise<string> {
        try {
            return jwt.sign(payload, this.secretKey, { expiresIn: '1d' });
        } catch (error) {
            throw new Error('Token generation failed');
        }
    }

    async verify(token: string): Promise<any> {
        try {
            return jwt.verify(token, this.secretKey);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async decode(token: string): Promise<any> {
        try {
            return jwt.decode(token);
        } catch (error) {
            throw new Error('Token decode failed');
        }
    }
}

export const jwtService = new JwtService();
