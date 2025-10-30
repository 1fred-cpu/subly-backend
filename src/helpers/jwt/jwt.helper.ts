import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";

interface TokenPair {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
}

@Injectable()
export class JwtHelper {
    private readonly accessSecret: string;
    private readonly refreshSecret: string;
    private readonly accessExpiresIn: string;
    private readonly refreshExpiresIn: string;

    constructor(private readonly configService: ConfigService) {
        this.accessSecret = this.configService.get<string>(
            "JWT_ACCESS_SECRET",
            ""
        );
        this.refreshSecret = this.configService.get<string>(
            "JWT_REFRESH_SECRET",
            ""
        );
        this.accessExpiresIn = this.configService.get<string>(
            "JWT_ACCESS_EXPIRES_IN",
            "15m"
        );
    }

    // ✅ Generate Access Token
    generateAccessToken(payload: object): string {
        return jwt.sign(payload, this.accessSecret, {
            expiresIn: "1h"
        });
    }

    // ✅ Generate Refresh Token
    generateRefreshToken(payload: object): string {
        return jwt.sign(payload, this.refreshSecret, {
            expiresIn: "7"
        });
    }

    // ✅ Verify Access Token
    verifyAccessToken<T = any>(token: string): T | null {
        try {
            return jwt.verify(token, this.accessSecret) as T;
        } catch {
            return null;
        }
    }

    // ✅ Verify Refresh Token
    verifyRefreshToken<T = any>(token: string): T | null {
        try {
            return jwt.verify(token, this.refreshSecret) as T;
        } catch {
            return null;
        }
    }

    // ✅ Decode (without verifying signature)
    decodeToken<T = any>(token: string): T | null {
        const decoded = jwt.decode(token);
        return decoded ? (decoded as T) : null;
    }

    // ✅ Generate Token Pair (access + refresh)
    generateTokenPair(payload: object): TokenPair {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        const accessTokenExpiresAt = new Date(
            Date.now() + this.parseDuration(this.accessExpiresIn)
        );
        const refreshTokenExpiresAt = new Date(
            Date.now() + this.parseDuration(this.refreshExpiresIn)
        );

        return {
            accessToken,
            refreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt
        };
    }

    // ✅ Async Verification (for scalable async services)
    async verifyTokenAsync<T = any>(
        token: string,
        secret: string
    ): Promise<T | null> {
        return new Promise(resolve => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) return resolve(null);
                resolve(decoded as T);
            });
        });
    }

    // ✅ Helper for parsing "15m", "7d", etc.
    private parseDuration(duration: string): number {
        const match = duration.match(/^(\d+)([smhd])$/);
        if (!match) return 0;
        const value = parseInt(match[1], 10);
        const unit = match[2];
        const multipliers: Record<string, number> = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000
        };
        return value * (multipliers[unit] || 0);
    }
}
