import { Component } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ConfigService } from "../config.service";
import { Config } from "../interfaces/Config";
import { Router } from "@angular/router";

@Component({
  selector: "app-config",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./config.component.html",
  styleUrl: "./config.component.css",
})
export class ConfigComponent {
  public apiKey = new FormControl("", [Validators.required]);
  public speakModel = new FormControl("aura-2-athena-en", [
    Validators.required,
    () => (control: AbstractControl) =>
      [
        "aura-2-amalthea-en",
        "aura-2-andromeda-en",
        "aura-2-apollo-en",
        "aura-2-arcas-en",
        "aura-2-aries-en",
        "aura-2-asteria-en",
        "aura-2-athena-en",
        "aura-2-atlas-en",
        "aura-2-aurora-en",
        "aura-2-callista-en",
        "aura-2-cordelia-en",
        "aura-2-cora-en",
        "aura-2-cressida-en",
        "aura-2-delia-en",
        "aura-2-draco-en",
        "aura-2-electra-en",
        "aura-2-harmonia-en",
        "aura-2-helena-en",
        "aura-2-hera-en",
        "aura-2-hermes-en",
        "aura-2-hyperion-en",
        "aura-2-iris-en",
        "aura-2-janus-en",
        "aura-2-juno-en",
        "aura-2-jupiter-en",
        "aura-2-luna-en",
        "aura-2-mars-en",
        "aura-2-minerva-en",
        "aura-2-neptune-en",
        "aura-2-odysseus-en",
        "aura-2-ophelia-en",
        "aura-2-orion-en",
        "aura-2-orpheus-en",
        "aura-2-pandora-en",
        "aura-2-phoebe-en",
        "aura-2-pluto-en",
        "aura-2-saturn-en",
        "aura-2-selene-en",
        "aura-2-thalia-en",
        "aura-2-theia-en",
        "aura-2-vesta-en",
        "aura-2-zeus-en",
        "aura-asteria-en",
        "aura-luna-en",
        "aura-athena-en",
        "aura-stella-en",
        "aura-hera-en",
        "aura-orion-en",
        "aura-arcas-en",
        "aura-perseus-en",
        "aura-angus-en",
        "aura-orpheus-en",
        "aura-helios-en",
        "aura-zeus-en",
      ].includes(control.value),
  ]);
  public listenModel = new FormControl("nova-2", [
    Validators.required,
    () => (control: AbstractControl) =>
      [
        "nova-3",
        "nova-3-medical",
        "nova-2",
        "nova-2-meeting",
        "nova-2-phonecall",
        "nova-2-finance",
        "nova-2-conversationalai",
        "nova-2-finance",
        "nova-2-voicemail",
        "nova-2-video",
        "nova-2-medical",
        "nova-2-drivethru",
        "nova-2-automotive",
        "nova-2-atc",
        "nova",
        "nova-phonecall",
        "nova-medical",
        "enhanced",
        "enhanced-phonecall",
        "enhanced-meeting",
        "enhanced-finance",
        "base",
        "base-phonecall",
        "base-meeting",
        "base-finance",
        "base-conversationalai",
        "base-voicemail",
        "base-video",
        "whisper-tiny",
        "whisper-small",
        "whisper-medium",
        "whisper-large",
        "whisper-base",
      ].includes(control.value),
  ]);
  public thinkModel = new FormControl("claude-3-haiku-20240307", [
    Validators.required,
    () => (control: AbstractControl) =>
      ["claude-3-haiku-20240307", "gpt-4o-mini"].includes(control.value),
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
      thinkModel: String(this.thinkModel.value),
    };
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
