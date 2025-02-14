import { Component } from "@angular/core";
import { ConfigService } from "../config.service";
import { Config } from "../interfaces/Config";
import { CommonModule } from "@angular/common";
import {
  AgentEvents,
  AgentLiveClient,
  createClient,
  DeepgramClient,
} from "@deepgram/sdk";
import { Router } from "@angular/router";
import { AudioRecorderService } from "../audio-recorder.service.js";

@Component({
  selector: "app-agent",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./agent.component.html",
  styleUrl: "./agent.component.css",
})
export class AgentComponent {
  private config: Config | null = null;
  private deepgram: DeepgramClient | null = null;
  private agent: AgentLiveClient | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  public messages: { type: "user" | "assistant"; content: string }[] = [];
  public connected = false;
  public errors: string[] = [];
  public logs: string[] = [];
  public recording = false;
  public togglingMic = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly router: Router,
    private readonly recorder: AudioRecorderService
  ) {
    this.ensureConfig();
  }

  private async mountAgent() {
    this.agent = this.deepgram!.agent();
    this.agent.on(AgentEvents.Error, (err) => this.errors.push(err.message));
    this.agent.on(AgentEvents.Open, () =>
      this.logs.push("Websocket connection opened!")
    );
    this.agent.on(AgentEvents.Close, () => {
      this.logs.push("Websocket connection closed!");
      this.connected = false;
      clearInterval(this.interval!);
      this.interval = null;
    });
    this.agent.on(AgentEvents.SettingsApplied, () => {
      this.logs.push("Deepgram Agent configured!");
      this.connected = true;
      this.interval = setInterval(() => this.agent!.keepAlive(), 5000);
    });
    this.agent.on(AgentEvents.ConversationText, (data) =>
      this.messages.push({
        type: data.role === "user" ? "user" : "assistant",
        content: data.content,
      })
    );
    this.agent.on(AgentEvents.Audio, (data) => {
      this.logs.push("Audio received: type " + typeof data);
      const audio = document.querySelector("audio");
      if (!audio) {
        this.errors.push("No audio element found!");
        return;
      }
      audio.src = URL.createObjectURL(data);
      audio.play();
    });
    this.agent.on(AgentEvents.AgentThinking, () => {
      this.logs.push("Agent is thinking...");
    });
    this.agent.on(AgentEvents.Unhandled, (data) => {
      this.errors.push("Unhandled event! " + JSON.stringify(data));
    });
    this.agent.on(AgentEvents.Welcome, () => {
      this.logs.push("Deepgram Agent connected!");
      this.agent!.configure({
        audio: {
          input: {
            encoding: "linear16",
            sampleRate: 44100,
          },
          output: {
            encoding: "linear16",
            sampleRate: 16000,
            container: "wav",
          },
        },
        agent: {
          // @ts-expect-error Whatever.
          listen: {
            model: this.config!.listenModel,
          },
          speak: {
            model: this.config!.speakModel,
          },
          think:
            this.config!.thinkModel === "claude-3-haiku-20240307"
              ? {
                  provider: {
                    type: "anthropic",
                  },
                  model: "claude-3-haiku-20240307",
                  instructions:
                    "You are a desktop assistant named Fortuna. Your purpose is to assist the user in their daily tasks.",
                  functions: [],
                }
              : {
                  provider: {
                    type: "open_ai",
                  },
                  model: "gpt-4o-mini",
                  instructions:
                    "You are a desktop assistant named Fortuna. Your purpose is to assist the user in their daily tasks.",
                  functions: [],
                },
        },
        context: {
          messages: this.messages,
          replay: false,
        },
      });
    });
  }

  private async ensureConfig() {
    this.config = this.configService.getConfig();
    if (!this.config?.apiKey) {
      await this.router.navigate(["/config"]);
      return;
    }
    this.deepgram = createClient(this.config.apiKey);
  }

  public disconnect() {
    this.logs.push("Disconnecting...");
    this.agent!.conn!.close();
  }

  public connect() {
    this.logs.push("Connecting...");
    this.mountAgent();
  }

  public async startRecording() {
    this.togglingMic = true;
    try {
      await this.recorder.startRecording(this.logs, this.errors);
      this.recording = true;
      this.logs.push("Recording started!");
    } catch (err) {
      if (err instanceof Error || err instanceof DOMException) {
        this.errors.push(err.message);
        return;
      }
      this.errors.push(JSON.stringify(err));
    }
    this.togglingMic = false;
  }

  public async stopRecording() {
    this.togglingMic = true;
    try {
      const blob = await this.recorder.stopRecording();
      this.logs.push("Recording stopped!");
      this.recording = false;
      if (this.agent) {
        this.agent.send(blob);
        this.logs.push(`Sent ${blob.size} bytes of audio!`);
      }
    } catch (err) {
      if (err instanceof Error || err instanceof DOMException) {
        this.errors.push(err.message);
        return;
      }
      this.errors.push(JSON.stringify(err));
    }
    this.togglingMic = false;
  }

  public clearErrors() {
    this.errors = [];
  }

  public clearLogs() {
    this.logs = [];
  }

  public clearTranscript() {
    this.messages = [];
  }
}
