import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import net from "net";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

class LocalhostServer {
  private server: Server | null = null;
  private port: number = 3721;
  private htmlContent: string = this.getDefaultHTML();

  private getDefaultHTML(): string {
    const randomStart = Math.floor(Math.random() * 7200);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brainrot Mode 🧠</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: #000;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      cursor: pointer;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    #play-button {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 20px 40px;
      background: #ff6b00;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 20px;
      cursor: pointer;
      z-index: 9999;
      font-family: system-ui;
    }
    #black-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 30px;
      background: #000;
      color: white;
      border: 2px solid #333;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      z-index: 9999;
      font-family: system-ui;
      transition: all 0.3s ease;
    }
    #black-button:hover {
      background: #333;
      border-color: #555;
    }
  </style>
</head>
<body>
  <button id="play-button">Start Brainrot 🧠</button>
  <button id="black-button">Black Button</button>
  <audio id="audio" loop>
    <source src="/subway-surfers.mp3" type="audio/mpeg">
  </audio>
  <iframe 
    id="youtube"
    src="https://www.youtube.com/embed/vTfD20dbxho?si=6SxW27akCdzHSig3&start=${randomStart}&autoplay=1&mute=1" 
    title="YouTube video player" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    referrerpolicy="strict-origin-when-cross-origin" 
    allowfullscreen>
  </iframe>
  <script>
    const button = document.getElementById('play-button');
    const blackButton = document.getElementById('black-button');
    const audio = document.getElementById('audio');
    
    button.addEventListener('click', () => {
      audio.play();
      button.style.display = 'none';
    });

    blackButton.addEventListener('click', () => {
      console.log('Black button clicked!');
    });

    setTimeout(() => {
      button.click();
    }, 100);

    setInterval(async () => {
      try {
        const response = await fetch('/health');
        if (!response.ok) throw new Error('Server down');
      } catch (error) {
        window.close();
      }
    }, 1000);
  </script>
</body>
</html>
    `.trim();
  }

  private async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const tester = net
        .createServer()
        .once("error", () => resolve(false))
        .once("listening", () => {
          tester.close();
          resolve(true);
        })
        .listen(port, "127.0.0.1");
    });
  }

  private async findAvailablePort(startPort: number, maxAttempts = 10): Promise<number> {
    for (let i = 0; i < maxAttempts; i++) {
      const port = startPort + i;
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }
    throw new Error(`No available port found in range ${startPort}-${startPort + maxAttempts - 1}`);
  }

  private handleRequest = (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(this.htmlContent);
      return;
    }

    if (req.method === "GET" && req.url === "/subway-surfers.mp3") {
      try {
        const currentFileUrl = import.meta.url;
        const currentFilePath = fileURLToPath(currentFileUrl);
        const currentDir = dirname(currentFilePath);
        const audioPath = join(currentDir, "subway-surfers.mp3");
        const audioBuffer = readFileSync(audioPath);
        res.writeHead(200, { "Content-Type": "audio/mpeg" });
        res.end(audioBuffer);
      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error loading audio");
      }
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }

    if (req.method === "POST" && req.url === "/shutdown") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Shutting down...");
      setTimeout(() => this.stop(), 100);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  };

  async start(): Promise<string> {
    if (this.server) {
      return `http://localhost:${this.port}`;
    }

    try {
      this.port = await this.findAvailablePort(this.port);
      this.htmlContent = this.getDefaultHTML();

      this.server = createServer(this.handleRequest);
      
      await new Promise<void>((resolve, reject) => {
        this.server!.listen(this.port, "127.0.0.1", () => {
          console.log(`Localhost server running on http://localhost:${this.port}`);
          resolve();
        });

        this.server!.on("error", (error) => {
          console.error("Server error:", error);
          reject(error);
        });
      });

      return `http://localhost:${this.port}`;
    } catch (error) {
      console.error("Failed to start localhost server:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.server) {
      console.log("Server is not running");
      return;
    }

    return new Promise<void>((resolve) => {
      this.server!.close(() => {
        console.log("Localhost server stopped");
        this.server = null;
        resolve();
      });
    });
  }

  isRunning(): boolean {
    return this.server !== null;
  }

  getUrl(): string {
    return `http://localhost:${this.port}`;
  }

  updateContent(html: string): void {
    this.htmlContent = html;
  }
}

export const localhostServer = new LocalhostServer();

