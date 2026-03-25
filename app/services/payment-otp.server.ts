// Server-side in-memory OTP store for payment verification
// Keyed by phone number; entries expire after 10 minutes

interface OTPEntry {
    otp: string;
    expiresAt: number;
}

const otpStore = new Map<string, OTPEntry>();

export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(phone: string, otp: string): void {
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(phone, { otp, expiresAt });
}

export function verifyOTP(phone: string, otp: string): boolean {
    const entry = otpStore.get(phone);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
        otpStore.delete(phone);
        return false;
    }
    if (entry.otp !== otp) return false;
    otpStore.delete(phone); // consume after successful verification
    return true;
}
