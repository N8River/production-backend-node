export interface RegisterRequestBody {
  username: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    username: string;
  };
}

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    username: string;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenRequestBody {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LogoutRequestBody {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}
