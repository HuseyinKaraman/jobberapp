import axios from 'axios';
import { sign } from 'jsonwebtoken';
import { config } from '@gateway/config';

export class AxiosService {
  public axiosInstance: ReturnType<typeof axios.create>;

  constructor(baseURL: string, serviceName: string) {
    this.axiosInstance = this.axiosCreateInstance(baseURL, serviceName);
  }

  public axiosCreateInstance(baseURL: string, serviceName?: string): ReturnType<typeof axios.create> {
    let requestGatewayToken = '';
    if (serviceName) {
      requestGatewayToken = sign({ id: serviceName }, `${config.GATEWAY_JWT_TOKEN}`);
    }
    const instance: ReturnType<typeof axios.create> = axios.create({
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        gatewayToken: requestGatewayToken
      },
      withCredentials: true
    });
    return instance;
  }
}
