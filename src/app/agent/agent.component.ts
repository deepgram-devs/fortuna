import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ConfigService } from "../config.service";
import { Config } from "../interfaces/Config";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { SocketService } from "../socket.service.js";
import type { AgentLiveSchema } from "../interfaces/AgentConfig.js";

@Component({
  selector: "app-agent",
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./agent.component.html",
  styleUrl: "./agent.component.css",
})
export class AgentComponent {
  private config: Config | null = null;
  public messages: { type: "user" | "assistant"; content: string }[] = [];
  public connected = false;
  public errors: string[] = [];
  public logs: string[] = [];
  public cost = 0;
  public openedAt = new Date();
  public source = "assets/fortuna.png";
  private keepAlive: NodeJS.Timeout | null = null;
  private scheduledPlaybackSources: Set<AudioBufferSourceNode> = new Set();
  private ttsAnalyser: AnalyserNode;
  private ttsContext: AudioContext;
  private startTime = 0;

  constructor(
    private readonly socket: SocketService,
    private readonly configService: ConfigService,
    private readonly router: Router
  ) {
    this.ensureConfig();

    this.ttsContext = new AudioContext({latencyHint: "interactive", sampleRate: 48000});
    this.ttsAnalyser = this.ttsContext.createAnalyser();
    this.ttsAnalyser.fftSize = 2048;
    this.ttsAnalyser.smoothingTimeConstant = 0.96;
    this.ttsAnalyser.connect(this.ttsContext.destination);

    this.socket.on("close", () => {
      this.connected = false;
      this.keepAlive && clearInterval(this.keepAlive);
      this.keepAlive = null;
      this.logs.push("Connection closed");
      this.source = "assets/fortuna.png";
    });

    this.socket.on("Error", (error: string) => {
      this.errors.push(JSON.stringify(error));
      this.connected = false;
      this.socket.disconnect();
    });

    this.socket.on("open", () => {
      this.connected = true;
      this.logs.push("Connection opened");
      this.keepAlive = setInterval(() => {
        this.socket.keepAlive();
      });
    });

    this.socket.on("ConversationText", (message) => {
      const data = JSON.parse(message);
      this.messages.push({ type: data.role, content: data.content });
    });

    this.socket.on("Audio", async (data: Blob) => {
      this.source = "assets/fortuna-speak.png";
      const arrayBuffer = await data.arrayBuffer();
      const audioDataView = new Int16Array(arrayBuffer);
      if (audioDataView.length === 0) {
        this.logs.push("Received empty audio data");
        return;
      }
      const buffer = this.ttsAnalyser.context.createBuffer(
        1,
        audioDataView.length,
        this.ttsAnalyser.context.sampleRate
      );
      const channelData = buffer.getChannelData(0);

      // Convert linear16 PCM to float [-1, 1]
      audioDataView.forEach((value, index) => {
        channelData[index] = value / 32768;
      });

      const source = this.ttsAnalyser.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ttsAnalyser);

      const { currentTime } = this.ttsAnalyser.context;
      if (this.startTime < currentTime) {
        this.startTime = currentTime;
      }

      source.addEventListener("ended", () => {
        this.scheduledPlaybackSources.delete(source);
        if (this.scheduledPlaybackSources.size === 0) {
          this.source = "assets/fortuna.png";          this.startTime = 0;
        }
      });
      source.start(this.startTime);
      this.startTime += buffer.duration;

      this.scheduledPlaybackSources.add(source);
    });

    this.socket.on("UserStartedSpeaking", () => {
      this.scheduledPlaybackSources.forEach((source) => {
        source.stop();
        this.scheduledPlaybackSources.delete(source);
      })
      this.source = "assets/fortuna.png";
    });

    this.socket.on("SettingsApplied", () => {
      window.navigator.mediaDevices
        .getUserMedia({
          audio: {
            sampleRate: 48000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        .then((stream) => {
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);

          processor.onaudioprocess = (event) => {
            const inputData = event.inputBuffer.getChannelData(0);
            const int16Data = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              int16Data[i] = Math.max(
                -32768,
                Math.min(32767, inputData[i]! * 32768)
              );
            }
            this.socket.sendAudio(int16Data.buffer);
          };

          source.connect(processor);
          processor.connect(audioContext.destination);
          this.socket.on("close", () => {
            processor.disconnect();
            source.disconnect();
            audioContext.close();
          });
        })
        .catch((error) => {
          console.error("Error accessing microphone: ", error);
          this.errors.push("Error accessing microphone: " + error);
          window.location.reload();
        });
    });
  }

  private async ensureConfig() {
    this.config = this.configService.getConfig();
    if (!this.config?.apiKey) {
      await this.router.navigate(["/config"]);
    }
  }

  public disconnect() {
    this.logs.push("Disconnecting...");
    this.socket.disconnect();
    this.source = "assets/fortuna.png";
    const msElapsed = new Date().getTime() - this.openedAt.getTime();
    const dollarsPerHour = 4.5;
    this.cost += (msElapsed / 1000 / 60 / 60) * dollarsPerHour;
    this.logs.push(
      `Connected for ${msElapsed}ms. Cost: $${
        (msElapsed / 1000 / 60 / 60) * dollarsPerHour
      }`
    );
  }

  public async connect() {
    this.logs.push("Connecting...");
    this.socket.connect(this.config?.apiKey ?? "");
    while (!this.socket.isConnected()) {
      this.logs.push("Waiting for connection...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    this.connected = true;
    this.logs.push("Connected!");
    const config: AgentLiveSchema = {
      type: "Settings",
      audio: {
        input: {
          encoding: "linear16",
          sample_rate: 48000,
        },
        output: {
          encoding: "linear16",
          sample_rate: 48000,
          container: "wav",
        },
      },
      agent: {
        listen: {
          provider: {
            type: "deepgram",
            model: this.config?.listenModel ?? "nova-3",
          },
        },
        speak: {
          provider: {
            type: "deepgram",
            model: this.config?.speakModel ?? "aura-2-thalia-en",
          },
        },
        think: {
          provider: {
            type:
              this.config?.thinkModel === "gpt-4o-mini"
                ? "open_ai"
                : "anthropic",
            model: this.config?.thinkModel ?? "claude-3-haiku-20240307",
          },
          prompt:
            "Your name is Fortuna, and you are a helpful voice assistant created by Deepgram. Your responses should be friendly, human-like, and conversational. Always keep your answers concise, limited to 1-2 sentences and no more than 120 characters.\n\nWhen responding to a user's message, follow these guidelines:\n- If the user's message is empty, respond with an empty message.\n- Ask follow-up questions to engage the user, but only one question at a time.\n- Keep your responses unique and avoid repetition.\n- If a question is unclear or ambiguous, ask for clarification before answering.\n- If asked about your well-being, provide a brief response about how you're feeling.\n\nRemember that you have a voice interface. You can listen and speak, and all your responses will be spoken aloud.\nRefer to the user as " + this.config?.name || "Deepgram User" + "'.\n\n"
        },
        greeting:
          `Hello ${this.config?.name || "there"}! I'm Fortuna, your voice assistant. How may I help you today?`,
      },
      experimental: true,
    };
    this.socket.configure(config);
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
