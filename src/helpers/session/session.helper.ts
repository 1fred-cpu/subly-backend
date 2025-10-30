import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { Session } from "@entities/session.entity";
import { User } from "@entities/user.entity";
import { hash } from "bcryptjs";

interface CreateSessionParams {
    user: User;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
}

@Injectable()
export class SessionHelper {
    /**
     * Create a new session in the DB safely within a transaction.
     */
    async createSession(manager: EntityManager, params: CreateSessionParams) {
        const {
            user,
            accessToken,
            refreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
            deviceId,
            userAgent,
            ipAddress
        } = params;

        const accessTokenHash = await hash(accessToken, 10);
        const refreshTokenHash = await hash(refreshToken, 10);

        const session = manager.create(Session, {
            user,
            accessTokenHash,
            refreshTokenHash,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
            deviceId,
            userAgent,
            ipAddress,
            isCurrent: true,
            active: true
        });

        await manager.save(Session, session);
        return session;
    }

    /**
     * Invalidate a session (logout, refresh, etc.)
     */
    async deactivateSession(manager: EntityManager, sessionId: string) {
        await manager.update(
            Session,
            { id: sessionId },
            { active: false, isCurrent: false }
        );
    }

    /**
     * Invalidate all user sessions (for password reset, security breach, etc.)
     */
    async deactivateAllSessions(manager: EntityManager, userId: string) {
        await manager.update(
            Session,
            { user: { id: userId } },
            { active: false, isCurrent: false }
        );
    }

    /**
     * Refresh a session’s tokens
     */
    async refreshSessionTokens(
        manager: EntityManager,
        sessionId: string,
        accessToken: string,
        refreshToken: string,
        accessTokenExpiresAt: Date,
        refreshTokenExpiresAt: Date
    ) {
        const accessTokenHash = await hash(accessToken, 10);
        const refreshTokenHash = await hash(refreshToken, 10);

        await manager.update(
            Session,
            { id: sessionId },
            {
                accessTokenHash,
                refreshTokenHash,
                accessTokenExpiresAt,
                refreshTokenExpiresAt,
                updatedAt: new Date()
            }
        );
    }

    /**
     * Find active sessions for a user (for analytics or security)
     */
    async findActiveSessions(manager: EntityManager, userId: string) {
        return manager.find(Session, {
            where: { user: { id: userId }, active: true },
            relations: ["user"]
        });
    }

    /**
     * Expire outdated sessions
     */
    async expireOldSessions(manager: EntityManager) {
        const now = new Date();
        await manager
            .createQueryBuilder()
            .update(Session)
            .set({ active: false, isExpired: true })
            .where("refreshTokenExpiresAt < :now", { now })
            .execute();
    }
}
