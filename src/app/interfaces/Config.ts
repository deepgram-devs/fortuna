import type { AgentLiveSchema} from "@deepgram/sdk";

export interface Config {
  apiKey: string;
  speakModel: AgentLiveSchema["agent"]["speak"]["model"];
  thinkModel: AgentLiveSchema["agent"]["think"]["model"];
  listenModel: AgentLiveSchema["agent"]["listen"]["model"];
}
