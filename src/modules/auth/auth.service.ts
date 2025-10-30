import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthProviders, User } from '@entities/user.entity';
import { Session } from '@entities/session.entity';
import { JwtHelper } from '@helpers/jwt/jwt.helper';
import { ApiKeyHelper } from '@helpers/api-key/api-key.helper';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from 'src/channels/email/email.service';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from './dto/signin.dto';
import { compareSync, hash } from 'bcryptjs';
import { SessionHelper } from '@helpers/session/session.helper';
import { addDays, addMinutes, isBefore, isAfter } from 'date-fns';
import { OAuth2Client } from 'google-auth-library';
import { Company } from '@entities/company.entity';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  private googleClient;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private jwtHelper: JwtHelper,
    private apiKeyHelper: ApiKeyHelper,
    private dataSource: DataSource,
    private emailService: EmailService,
    private configService: ConfigService,
    private sessionHelper: SessionHelper,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  //-------------------------------
  // Register a company
  //-------------------------------
  async register(dto: RegisterDto) {
    const { companyEmail, companyName, password, adminEmail, adminName } = dto;
    // create a query runner
    const queryRunner = this.dataSource.createQueryRunner();
    // establish real database connection using our new query runner
    await queryRunner.connect();
    // now we can start a transaction
    await queryRunner.startTransaction();
    try {
      // Check if company email already exists
      const existingCompany = (await queryRunner.manager.findOne(Company, {
        where: { email: companyEmail },
      })) as any;

      // If company exists, throw conflict exception
      if (existingCompany) {
        throw new ConflictException('Company with this email already exists');
      }

      // Creates a new company instance
      const newCompany = queryRunner.manager.create(Company, {
        email: companyEmail,
        name: companyName,
      });

      // Save the new company to the database
      await queryRunner.manager.save(newCompany);

      // Check an existing admin user exists
      const existingAdmin = await queryRunner.manager.findOne(User, {
        where: {
          email: adminEmail,
          company: { id: existingCompany.id },
        },
      });

      // If admin user exists, throw conflict exception
      if (existingAdmin) {
        throw new ConflictException('User with this email already exists');
      }

      // Create a new admin user instance
      const newUser = await queryRunner.manager.create(User, {
        name: adminName,
        email: adminEmail,
        passwordHash: password,
        role: 'owner',
        department: null,
      });

      // Save admin user to database
      await queryRunner.manager.save(newUser);

      // Create a email verification token for the user and expires at value
      const emailVerificationToken = newUser.generateEmailVerificationToken();

      // Save the updated user with verification token
      await queryRunner.manager.save(newUser);

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Verification url link
      const url = `${this.configService
        .get<'FRONTEND_URL'>}/verify-email?token=${emailVerificationToken}`;

      // Send verification email (uses bullmq under the hood)
      await this.emailService.sendEmail('verification', {
        name: newUser.name,
        to: newUser.email,
        url,
      });

      return {
        message:
          'User registered successfully. Please check your email to verify your account.',
      };
    } catch (error) {
      // If we have errors, rollback the transaction
      await queryRunner.rollbackTransaction();
      // Throws an error if has an instance of conflict exception
      if (error instanceof ConflictException) throw error;

      this.logger.error(`Error during sign up: ${error.message}`);
      throw new InternalServerErrorException('Faild to sign up user');
    } finally {
      // Release the query runner which is manually created
      await queryRunner.release();
    }
  }

  //-------------------------------
  // Sign In User
  //-------------------------------
  async signIn(
    dto: SignInDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string; user?: any; session?: any }> {
    const { email, password } = dto;

    // Create a queryRunner for transaction
    const queryRunner = this.dataSource.createQueryRunner();
    // Establish real database connection
    await queryRunner.connect();
    // Start transaction
    await queryRunner.startTransaction();

    try {
      // Find user by email
      const user = await queryRunner.manager.findOne(User, {
        where: { email },
      });

      // If user not found, throw unauthorized exception
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Validate password
      const isPasswordValid = await compareSync(password, user.passwordHash);

      // If password is not valid throw unauthorized exception
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if user email is verified
      if (!user.emailVerified) {
        // Create a email verification token for the user and expires at value
        const emailVerificationToken = user.generateEmailVerificationToken();

        // Save the updated user with verification token
        await queryRunner.manager.save(user);

        // Commit the transaction
        await queryRunner.commitTransaction();

        // Verification url link
        const url = `${this.configService
          .get<'FRONTEND_URL'>}/verify-email?token=${emailVerificationToken}`;

        // Resend verification email
        await this.emailService.sendEmail('verification', {
          name: user.name,
          to: user.email,
          url,
        });

        return {
          message:
            'Email not verified. Please verify your email before signing in.',
        };
      }

      // Create access token
      const accessToken = this.jwtHelper.generateAccessToken({
        userId: user.id,
      });

      // Create a access token expires at
      const accessTokenExpiresAt = addMinutes(new Date(), 15); // 15 minutes

      // Create refresh token
      const refreshToken = this.jwtHelper.generateRefreshToken({
        userId: user.id,
      });

      // Create a refresh token expires at
      const refreshTokenExpiresAt = addDays(new Date(), 7); // 7 days

      // Create a new session
      const session = await this.sessionHelper.createSession(
        queryRunner.manager,
        {
          user,
          accessToken,
          refreshToken,
          ipAddress,
          userAgent,
          refreshTokenExpiresAt,
          accessTokenExpiresAt,
        },
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Return tokens and session info
      return {
        message: 'User signed in successfully.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImageUrl: user.profileImageUrl,
        },
        session: {
          id: session.id,
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
        },
      };
    } catch (error) {
      // If we have errors, rollback the transaction
      await queryRunner.rollbackTransaction();

      // Throws an error if has an instance of unauthorized exception
      if (error instanceof UnauthorizedException) throw error;

      this.logger.error(`Error during sign in: ${error.stack}`);

      // Throw internal server error exception
      throw new InternalServerErrorException('Failed to sign in user');
    } finally {
      // Release the query runner which is manually created
      await queryRunner.release();
    }
  }

  //-------------------------------
  // Verify Email
  //-------------------------------
  async verifyEmail(token: string, ipAddress?: string, userAgent?: string) {
    // Create a queryRunner for transaction
    const queryRunner = this.dataSource.createQueryRunner();
    // Establish real database connection
    await queryRunner.connect();
    // Start transaction
    await queryRunner.startTransaction();

    try {
      // Find user by verification token
      const user = await queryRunner.manager.findOne(User, {
        where: { emailVerificationToken: token },
      });
      // If user not found or token expired, throw unauthorized exception
      if (
        !user ||
        !user.emailVerificationExpiresAt ||
        user.emailVerificationExpiresAt < new Date()
      ) {
        throw new UnauthorizedException(
          'Invalid or expired verification token',
        );
      }

      // Mark email as verified and clear verification token fields
      user.verifyEmail();

      // Save the updated user
      await queryRunner.manager.save(user);

      // Create access token
      const accessToken = this.jwtHelper.generateAccessToken({
        userId: user.id,
      });

      // Create a access token expires at
      const accessTokenExpiresAt = addMinutes(new Date(), 15); // 15 minutes

      // Create refresh token
      const refreshToken = this.jwtHelper.generateRefreshToken({
        userId: user.id,
      });

      // Create a refresh token expires at
      const refreshTokenExpiresAt = addDays(new Date(), 7); // 7 days

      // Create a new session
      const session = await this.sessionHelper.createSession(
        queryRunner.manager,
        {
          user,
          accessToken,
          refreshToken,
          ipAddress,
          userAgent,
          refreshTokenExpiresAt,
          accessTokenExpiresAt,
        },
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Dashboard url link
      const dashboardUrlLink = `${this.configService.get<string>('FRONTEND_URL')}/dashboard`;

      // Sends a welcome email to new user
      await this.emailService.sendEmail('welcome', {
        to: user.email,
        url: dashboardUrlLink,
        name: user.name,
      });

      // Return tokens and session info
      return {
        message: 'Email verified successfully.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImageUrl: user.profileImageUrl,
        },
        session: {
          id: session.id,
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
        },
      };
    } catch (error) {
      // If we have errors, rollback the transaction
      await queryRunner.rollbackTransaction();

      // Throws an error if has an instance of unauthorized exception
      if (error instanceof UnauthorizedException) throw error;

      this.logger.error(`Error during email verification: ${error.stack}`);

      // Throw internal server error exception
      throw new InternalServerErrorException('Failed to verify email');
    } finally {
      // Release the query runner which is manually created
      await queryRunner.release();
    }
  }

  //-------------------------------
  // Sign In With Google
  //-------------------------------
  async signInWithGoogle(
    idToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Create a queryRunner for transaction
    const queryRunner = this.dataSource.createQueryRunner();
    // Establish real database connection
    await queryRunner.connect();
    // Start transaction
    await queryRunner.startTransaction();

    try {
      if (!idToken) {
        throw new BadRequestException('Google ID token is required');
      }

      // Verify Google token
      const googleUser = await this.verifyGoogleToken(idToken);
      if (!googleUser?.email) {
        throw new UnauthorizedException('Unable to verify Google token');
      }
      // Normalize email
      const normalizedEmail = googleUser.email.trim().toLowerCase();
      // Get the manager entity
      const manager = queryRunner.manager;

      // Check if user already exists
      let user = await manager.findOne(User, {
        where: { email: normalizedEmail },
      });

      if (user) {
        // Prevent login if the account was created via email/password
        if (user.authProvider === AuthProviders.EMAIL) {
          throw new ConflictException(
            'This email is already registered with a password. Please sign in using email and password.',
          );
        }
      } else {
        // Create a new user from Google data
        const userRepo = queryRunner.manager.getRepository(User);
        user = userRepo.create({
          email: normalizedEmail,
          name: googleUser.name || 'Unnamed User',
          profileImageUrl: googleUser.picture,
          authProvider: AuthProviders.EMAIL,
          emailVerified: true, // Google guarantees verified emails
          isActive: true,
        });

        await userRepo.save(user);
      }

      // Create access token
      const accessToken = this.jwtHelper.generateAccessToken({
        userId: user.id,
      });

      // Create a access token expires at
      const accessTokenExpiresAt = addMinutes(new Date(), 15); // 15 minutes

      // Create refresh token
      const refreshToken = this.jwtHelper.generateRefreshToken({
        userId: user.id,
      });

      // Create a refresh token expires at
      const refreshTokenExpiresAt = addDays(new Date(), 7); // 7 days

      // Create a new session
      const session = await this.sessionHelper.createSession(
        queryRunner.manager,
        {
          user,
          accessToken,
          refreshToken,
          ipAddress,
          userAgent,
          refreshTokenExpiresAt,
          accessTokenExpiresAt,
        },
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      return {
        message: 'Sign in successfully.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImageUrl: user.profileImageUrl,
        },
        session: {
          id: session.id,
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Known handled errors are rethrown
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      // Log and rethrow as internal error for unhandled cases
      this.logger.error('Google Sign-in transaction failed', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred during Google sign-in',
      );
    } finally {
      await queryRunner.release();
    }
  }

  //-------------------------------
  // Refresh Access Token
  //-------------------------------
  async refreshAccessToken(payload: {
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<{ accessToken: string; accessTokenExpiresAt: Date }> {
    try {
      if (!payload?.userId || !payload?.refreshToken) {
        throw new BadRequestException('User ID and refresh token are required');
      }

      return await this.dataSource.transaction(
        async (manager: EntityManager) => {
          const sessionRepo = manager.getRepository(Session);

          // Find active session for user
          const session = await sessionRepo.findOne({
            where: { user: { id: payload.userId }, active: true },
            relations: ['user'],
          });

          if (!session) {
            throw new UnauthorizedException(
              'No active session found for this user',
            );
          }

          //  Validate refresh token match
          const isValidRefresh = await compareSync(
            payload.refreshToken,
            session.refreshTokenHash as string,
          );
          if (!isValidRefresh) {
            throw new UnauthorizedException('Invalid refresh token');
          }

          //  Check refresh token expiration
          if (isBefore(session.refreshTokenExpiresAt as Date, new Date())) {
            throw new UnauthorizedException(
              'Refresh token has expired. Please log in again.',
            );
          }

          // Generate new access token (short-lived)
          const newAccessToken = this.jwtHelper.generateAccessToken({
            userId: session.user.id,
          });
          const newAccessTokenExpiry = addMinutes(new Date(), 15); // 15 minutes

          //Rotate refresh token if it's expiring soon (< 1 day)
          let updatedRefreshToken = session.refreshTokenHash;
          let newRefreshExpiry = session.refreshTokenExpiresAt;
          const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

          if (isBefore(session.refreshTokenExpiresAt as Date, oneDayFromNow)) {
            updatedRefreshToken = this.jwtHelper.generateRefreshToken({
              userId: session.user.id,
            });
            updatedRefreshToken = await hash(updatedRefreshToken, 10);

            newRefreshExpiry = addDays(new Date(), 7); // Extend for 7 days
            this.logger.debug(
              `Rotated refresh token for user ${payload.userId} (near expiry).`,
            );
          }

          // Update session fields
          session.accessTokenHash = await hash(newAccessToken, 10);
          session.accessTokenExpiresAt = newAccessTokenExpiry;
          session.refreshTokenHash = updatedRefreshToken;
          session.refreshTokenExpiresAt = newRefreshExpiry;
          session.ipAddress = payload.ipAddress || session.ipAddress;
          session.userAgent = payload.userAgent || session.userAgent;
          session.updatedAt = new Date();

          await sessionRepo.save(session);

          this.logger.log(`Access token refreshed for user: ${payload.userId}`);

          // Return new tokens
          return {
            accessToken: newAccessToken,
            accessTokenExpiresAt: newAccessTokenExpiry,
          };
        },
      );
    } catch (error) {
      // Known errors are rethrown directly
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      //Log and wrap unexpected internal issues
      this.logger.error(
        `Failed to refresh access token for user ${payload.userId}: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException(
        'An unexpected error occurred while refreshing your access token. Please try again later. ',
      );
    }
  }

  //-------------------------------
  // Request Password Reset
  //-------------------------------
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Create query runner for transaction
    const queryRunner = this.dataSource.createQueryRunner();
    // Establish a query runner connect
    await queryRunner.connect();
    // Starts transaction
    await queryRunner.startTransaction();

    try {
      // Normalize email (trim it)
      const normalizedEmail = email.trim().toLowerCase();
      // Get user repository
      const userRepo = queryRunner.manager.getRepository(User);
      // Find user with normalizedEmail
      const user = await userRepo.findOne({
        where: {
          email: normalizedEmail,
        },
      });

      // If not found throw unauthorized exception
      if (!user) {
        throw new UnauthorizedException('No account found with that email');
      }

      // Generate reset token and expiry
      user.generatePasswordResetToken();

      // Save reset token and expiry add to user
      await userRepo.save(user);

      // Commit before sending mail (avoid rollback delay)
      await queryRunner.commitTransaction();

      // Reset url link
      const resetUrlLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${user.passwordResetToken}`;

      // Send password reset email
      try {
        await this.emailService.sendEmail('password_reset', {
          to: user.email,
          url: resetUrlLink,
        });
        this.logger.log(`Password reset email sent to ${user.email}`);
      } catch (mailError) {
        this.logger.error('Failed to send password reset email', mailError);
      }

      return {
        message: 'Password reset link has been sent to your email address',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'Request password reset transaction failed',
        error as any,
      );

      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to process password reset request',
      );
    } finally {
      await queryRunner.release();
    }
  }
  //-------------------------------
  // Reset Password
  //-------------------------------
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // If token and new password was not provided throw a BadRequestException
    if (!token) throw new BadRequestException('Reset token is required');
    if (!newPassword) throw new BadRequestException('New password is required');

    // Create a query runner for transaction
    const queryRunner = this.dataSource.createQueryRunner();
    // Establish a connect for queryRunner
    await queryRunner.connect();
    // Start transaction
    await queryRunner.startTransaction();

    try {
      // Find a user using query builder
      const user = await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .where('user.passwordResetToken = :token', { token })
        .getOne();

      // If user not found throw an UnauthorizedException
      if (!user) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }

      // Check token expiry
      if (
        !user.passwordResetExpiresAt ||
        isAfter(new Date(), user.passwordResetExpiresAt as Date)
      ) {
        throw new UnauthorizedException('Reset token has expired');
      }

      const hashedPassword = await hash(newPassword, 10);

      await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({
          passwordHash: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiresAt: null,
          updatedAt: new Date(),
        })
        .where('id = :id', { id: user.id })
        .execute();

      await queryRunner.commitTransaction();

      this.logger.log(`Password successfully reset for user ${user.email}`);
      return { message: 'Password has been successfully reset' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Reset password transaction failed', error as any);

      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to reset password. Please try again later.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /** Helpers Method */
  private async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();

      return {
        email: payload?.email,
        name: payload?.name,
        picture: payload?.picture,
        emailVerified: payload?.email_verified,
        sub: payload?.sub, // Google user ID
      };
    } catch (err) {
      this.logger.error('Invalid Google ID token', err);
      throw new UnauthorizedException('Invalid Google authentication token');
    }
  }
}
