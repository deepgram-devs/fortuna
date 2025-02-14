import { Injectable } from "@angular/core";

const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable({
  providedIn: "root",
})
export class AudioRecorderService {
  private chunks: Blob[] = [];
  private mediaRecorder: MediaRecorder | null = null;

  public async startRecording(logs: string[], errors: string[]) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        logs.push(`Recorded ${event.data.size} bytes of audio!`);
        this.chunks.push(event.data);
      };
      this.mediaRecorder.start();
      logs.push("MediaRecorder started!");
    } catch (err) {
      if (err instanceof Error) {
        errors.push(err.message);
        return;
      }
      errors.push(JSON.stringify(err));
    }
  }

  public async stopRecording(): Promise<Blob> {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    /**
     * Sleep in order to give stream time to finish recording.
     */
    await sleep(5000);
    const blob = new Blob(this.chunks);
    this.chunks = [];
    return blob;
  }
}
