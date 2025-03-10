import "@deepgram/browser-agent";
import { Component, CUSTOM_ELEMENTS_SCHEMA, type OnInit } from "@angular/core";
import { ConfigService } from "../config.service";
import { Config } from "../interfaces/Config";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: "app-agent",
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./agent.component.html",
  styleUrl: "./agent.component.css",
})
export class AgentComponent implements OnInit {
  private config: Config | null = null;
  public messages: { type: "user" | "assistant"; content: string }[] = [];
  public connected = false;
  public errors: string[] = [];
  public logs: string[] = [];
  private agentElement: HTMLElement | null = null;
  public cost = 0;
  public openedAt = new Date();

  constructor(
    private readonly configService: ConfigService,
    private readonly router: Router
  ) {
    this.ensureConfig();
  }

  ngOnInit() {
    this.agentElement = document.querySelector("#dg-agent");
    if (!this.agentElement) {
      this.errors.push("Deepgram Agent not found! Please reload the app.");
      return;
    }
    this.agentElement.addEventListener("no key", () =>
      this.errors.push("No API key provided!")
    );
    this.agentElement.addEventListener("no url", () =>
      this.errors.push("No Agent URL set.")
    );
    this.agentElement.addEventListener("no config", () =>
      this.errors.push("Failed to load config!")
    );
    this.agentElement.addEventListener("empty audio", () =>
      this.errors.push("Empty audio data!")
    );
    this.agentElement.addEventListener("socket open", () => {
      this.logs.push("Connected!");
      this.openedAt = new Date();
      this.connected = true;
    });
    this.agentElement.addEventListener("socket close", () => {
      this.logs.push("Disconnected!");
      this.connected = false;
      const msElapsed = new Date().getTime() - this.openedAt.getTime();
      const dollarsPerHour = 4.5;
      this.cost += (msElapsed / 1000 / 60 / 60) * dollarsPerHour;
      this.logs.push(`Connected for ${msElapsed}ms. Cost: $${(msElapsed / 1000 / 60 / 60) * dollarsPerHour}`);
    });
    this.agentElement.addEventListener("connection timeout", () => {
      this.logs.push("Connection Timeout");
      this.connected = false;
      this.agentElement?.removeAttribute("config");
    });
    this.agentElement.addEventListener("failed setup", () =>
      this.errors.push("Failed to instantiate agent. Please reload the app.")
    );
    this.agentElement.addEventListener("failed to connect user media", () =>
      this.errors.push("We require microphone permissions to work!")
    );
    this.agentElement.addEventListener("unknown message", (data) =>
      console.log(data)
    );
    this.agentElement.addEventListener("structured message", (data) => {
      const { detail } = data as CustomEvent;
      if (detail.type === "ConversationText") {
        this.messages.push({ type: detail.role, content: detail.content });
      }
    });
    this.agentElement.addEventListener("client message", (data) =>
      console.log(data)
    );
  }

  private async ensureConfig() {
    this.config = this.configService.getConfig();
    if (!this.config?.apiKey) {
      await this.router.navigate(["/config"]);
    }
  }

  public disconnect() {
    this.logs.push("Disconnecting...");
    this.agentElement?.removeAttribute("config");
  }

  public connect() {
    this.logs.push("Connecting...");
    // @ts-expect-error
    this.agentElement.apiKey = this.config?.apiKey;
    const config = {
      type: "SettingsConfiguration",
      audio: {
        input: {
          encoding: "linear16",
          sample_rate: 48000,
        },
        output: {
          encoding: "linear16",
          sample_rate: 48000,
          container: "none",
        },
      },
      agent: {
        listen: {
          model: this.config?.listenModel ?? "nova-3",
        },
        speak: {
          model: this.config?.speakModel ?? "aura-athena-en",
        },
        think: {
          model: this.config?.thinkModel ?? "claude-3-haiku-20240307",
          provider: {
            type:
              this.config?.thinkModel === "gpt-4o-mini"
                ? "open_ai"
                : "anthropic",
          },
          instructions:
            "Your name is Fortuna, and you are a helpful voice assistant created by Deepgram. Your responses should be friendly, human-like, and conversational. Always keep your answers concise, limited to 1-2 sentences and no more than 120 characters.\n\nWhen responding to a user's message, follow these guidelines:\n- If the user's message is empty, respond with an empty message.\n- Ask follow-up questions to engage the user, but only one question at a time.\n- Keep your responses unique and avoid repetition.\n- If a question is unclear or ambiguous, ask for clarification before answering.\n- If asked about your well-being, provide a brief response about how you're feeling.\n\nRemember that you have a voice interface. You can listen and speak, and all your responses will be spoken aloud.",
        },
      },
      context: {
        messages: [
          {
            content: "Hello, how can I help you?",
            role: "assistant",
          },
        ],
        replay: true,
      },
    };
    this.agentElement?.setAttribute("config", JSON.stringify(config));
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
