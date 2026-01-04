import { CookieJar } from 'tough-cookie';

interface VerifyResponse {
  flag: number;
  access_token: string;
  jwt: string;
  [key: string]: unknown;
}

interface RequestOtpResponse {
  flag: number;
  flagNameExist?: boolean;
  flag_allow_auth_name?: string;
  [key: string]: unknown;
}

export class PhoneEmailAuth {
  serialize() {
  return JSON.stringify({
    jar: this.cookieJar.toJSON(),
    ueFlag: this.ueFlag,
    allowAuthNameFlag: this.allowAuthNameFlag
  });
}

static deserialize(clientId: string, redirectUrl: string, jsonStr: string): PhoneEmailAuth {
  const data = JSON.parse(jsonStr);
  const client = new PhoneEmailAuth(clientId, redirectUrl);
  client.cookieJar = CookieJar.fromJSON(data.jar);
  client.ueFlag = data.ueFlag;
  client.allowAuthNameFlag = data.allowAuthNameFlag;
  return client;
}
  private clientId: string;
  private redirectUrl: string;
  private baseUrl: string;
  private cookieJar: CookieJar;

  private phoneCountry = '';
  private phoneNumber = '';
  private fname = '';
  private lname = '';
  private ueFlag = '1';
  private allowAuthNameFlag = '0';

  constructor(clientId: string, redirectUrl: string, baseUrl = 'https://auth.phone.email') {
    this.clientId = clientId;
    this.redirectUrl = redirectUrl;
    this.baseUrl = baseUrl;
    this.cookieJar = new CookieJar();
  }

  private replaceFirstZero(numStr: string): string {
    return numStr.startsWith('0') ? numStr.substring(1) : numStr;
  }

  private async getCookieHeader(url: string): Promise<string> {
    const cookies = await this.cookieJar.getCookies(url);
    return cookies.map(cookie => `${cookie.key}=${cookie.value}`).join('; ');
  }

  /**
   * Set cookies received from response headers.
   */
  private async setCookiesFromResponse(url: string, headers: Headers): Promise<void> {
    headers.forEach((value, name) => {
      if (name.toLowerCase() === 'set-cookie') {
        this.cookieJar.setCookie(value, url);
      }
    });
  }

  public async initializeSession(): Promise<Response> {
    console.log('[Session Init] Fetching initial login page...');
    const initialUrl = `${this.baseUrl}/log-in?client_id=${this.clientId}&auth_type=8&origin=${encodeURIComponent(this.redirectUrl)}`;

    const headers = {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    };

    const response = await fetch(initialUrl, { headers });
    await this.setCookiesFromResponse(initialUrl, response.headers);

    if (!response.ok) {
      throw new Error(`Failed to load login page: ${response.status}`);
    }

    console.log('[Session Init] Cookies collected.');
    return response;
  }

  public async requestOtp(phoneNo: string, phoneCountry: string): Promise<RequestOtpResponse> {
    console.log(`[Step 1] Requesting OTP for ${phoneCountry}${phoneNo}...`);
    this.phoneCountry = phoneCountry;
    this.phoneNumber = this.replaceFirstZero(phoneNo);

    const url = `${this.baseUrl}/submit-login`;

    const data = new URLSearchParams({
      phone_country: this.phoneCountry,
      phone_no: this.phoneNumber,
      client_id: this.clientId,
      redirect_url: this.redirectUrl
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
      Accept: '*/*',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: this.baseUrl
    };

    const cookieHeader = await this.getCookieHeader(url);
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data.toString()
    });

    await this.setCookiesFromResponse(url, response.headers);

    if (!response.ok) {
      throw new Error(`OTP request failed: ${response.status}`);
    }

    const json = (await response.json()) as RequestOtpResponse;
    console.log('[Step 1] Response:', json);

    if (json.flag === 1 || json.flag === 2 || json.flag === 6) {
      this.ueFlag = json.flagNameExist ? '1' : '0';
      if (json.flag_allow_auth_name) {
        this.allowAuthNameFlag = json.flag_allow_auth_name;
      }
    } else {
      throw new Error(`Failed to send OTP. Flag: ${json.flag}`);
    }

    return json;
  }

  public async verifyOtp(otp: string, firstName = '', lastName = ''): Promise<VerifyResponse> {
    if (!otp.trim()) {
      throw new Error('OTP cannot be empty.');
    }

    const url = `${this.baseUrl}/verify-login`;

    const data = new URLSearchParams({
      otp: otp.trim(),
      client_id: this.clientId,
      device: '',
      business_name: '',
      redirect_url: this.redirectUrl,
      fname: firstName,
      lname: lastName,
      ue: this.ueFlag,
      flag_allow_auth_name: this.allowAuthNameFlag
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
      Accept: '*/*',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: this.baseUrl
    };

    const cookieHeader = await this.getCookieHeader(url);
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data.toString()
    });

    await this.setCookiesFromResponse(url, response.headers);

    if (!response.ok) {
      throw new Error(`OTP verification failed: ${response.status}`);
    }

    const json = (await response.json()) as VerifyResponse;
    console.log('[Step 2] Verification response:', json);

    if (json.flag === 1) {
      return json;
    } else {
      throw new Error(`Verification failed. Flag: ${json.flag}`);
    }
  }

  public async fetchUserJson(userJsonUrl: string): Promise<unknown> {
    console.log(`Fetching user JSON: ${userJsonUrl}`);
    const headers: Record<string, string> = {};

    const cookieHeader = await this.getCookieHeader(userJsonUrl);
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    const response = await fetch(userJsonUrl, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch user JSON: ${response.status}`);
    }

    return response.json();
  }
}