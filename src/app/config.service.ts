import { Injectable } from '@angular/core';
import { Config } from "./interfaces/Config";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public getConfig(): Config | null {
    const config = localStorage.getItem("config");
    if (!config) {
      return null;
    }
    return JSON.parse(config) as Config;
  }

  public setConfig(config: Config) {
    localStorage.setItem("config", JSON.stringify(config));
  }
}
