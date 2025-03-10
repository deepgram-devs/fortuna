import { Component } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigService } from '../config.service';
import { Config } from '../interfaces/Config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent {
  public apiKey = new FormControl("", [
    Validators.required
  ]);
  public speakModel = new FormControl("aura-athena-en", [
    Validators.required,
    () => (control: AbstractControl) => ["aura-asteria-en", "aura-luna-en", "aura-athena-en", "aura-stella-en",
            "aura-hera-en", "aura-orion-en", "aura-arcas-en", "aura-perseus-en",
            "aura-angus-en", "aura-orpheus-en", "aura-helios-en", "aura-zeus-en"].includes(control.value)
  ]);
  public listenModel = new FormControl("nova-2", [
    Validators.required,
    () => (control: AbstractControl) => [            "nova-3", "nova-3-medical", "nova-2", "nova-2-meeting", "nova-2-phonecall", "nova-2-finance",
            "nova-2-conversationalai", "nova-2-finance", "nova-2-voicemail",
            "nova-2-video", "nova-2-medical", "nova-2-drivethru", "nova-2-automotive",
            "nova-2-atc", "nova", "nova-phonecall", "nova-medical", "enhanced",
            "enhanced-phonecall", "enhanced-meeting", "enhanced-finance", "base",
            "base-phonecall", "base-meeting", "base-finance", "base-conversationalai",
            "base-voicemail", "base-video", "whisper-tiny", "whisper-small",
            "whisper-medium", "whisper-large", "whisper-base"
].includes(control.value)
  ]);
  public thinkModel = new FormControl("claude-3-haiku-20240307", [
    Validators.required,
    () => (control: AbstractControl) => ["claude-3-haiku-20240307", "gpt-4o-mini"].includes(control.value)
  ]);

  public passType: "password" | "text" = "password";

  public togglePass() {
    this.passType = this.passType === "password" ? "text" : "password";
  }
  
  public save() {
    const config: Config = {
      apiKey: this.apiKey.value ?? "",
      speakModel: String(this.speakModel.value),
      listenModel: String(this.listenModel.value),
      thinkModel: String(this.thinkModel.value)
    }
    this.configService.setConfig(config);

    this.router.navigate(["/"]);
  }

  public cancel() {
    this.router.navigate(["/"]);
  }

  constructor(private configService: ConfigService, private router: Router) {
    const config = this.configService.getConfig();
    if (!config) {
      return;
    }
    this.apiKey.setValue(config.apiKey);
    this.speakModel.setValue(config.speakModel);
    this.listenModel.setValue(config.listenModel);
    this.thinkModel.setValue(config.thinkModel);
  } 
}
