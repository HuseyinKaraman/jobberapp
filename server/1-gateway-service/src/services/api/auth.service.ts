import { config } from "@gateway/config";
import axios, { AxiosResponse } from "axios";
import { AxiosService } from "@gateway/services/axios";
import { response } from "express";
import { IAuth } from "@huseyinkaraman/jobber-shared";

export let axiosAuthInstance : ReturnType<typeof axios.create>;

class AuthService {
  private axiosService: AxiosService;
  constructor() {
    this.axiosService = new AxiosService(`${config.AUTH_BASE_URL}/api/v1/auth`, 'auth');
    axiosAuthInstance = this.axiosService.axiosInstance;
  }

  public async getCurrentUser(): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAuthInstance.get('/current-user');
    return response;
  }
  
  public async getRefreshToken(username: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAuthInstance.get(`/refresh-token/${username}`);
    return response;
  }
  
  public async changePassword(currentPassword: string, newPassword: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAuthInstance.put(`/change-password`, { currentPassword, newPassword });
    return response;
  }

  public async verifyEmail(token: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAuthInstance.put('/verify-email', { token });
    return response;
  }

  public async resendEmail(data: {userId:number, email:string}): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAuthInstance.post('/resend-email', data);
    return response;
  }

  public async signup(body: IAuth): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axiosInstance.post('/signup', body);
    return response;
  }

  public async signin(body: IAuth): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axiosInstance.post('/signin', body);
    return response;
  }

  public async forgotPassword(email: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axiosInstance.put('/forgot-password', { email });
    return response;
  }
  
  public async resetPassword(token: string, password: string, confirmPassword: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axiosInstance.put(`/reset-password/${token}`, { password, confirmPassword });
    return response;
  }

  public async getGigs(query: string, from: string, limit: number, type: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axiosInstance.get(`/search/gigs/${from}/${limit}/${type}?${query}`);
    return response;
  }

  public async getGig(id: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axiosInstance.get(`/gigs/${id}`);
    return response;
  }

  public async seed(count: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await this.axiosService.axiosInstance.put(`/seed/${count}`);
    return response;
  }
}

export const authService : AuthService = new AuthService();
