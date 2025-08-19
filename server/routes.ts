import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Optional webhook logging endpoint
  app.post("/api/event", (req, res) => {
    const webhookUrl = process.env.WEBHOOK_URL;
    
    if (webhookUrl) {
      // Forward minimal event logs to webhook
      const { action, timestamp } = req.body;
      
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action || "unknown",
          timestamp: timestamp || new Date().toISOString(),
          source: "card-preview-app"
        })
      }).catch(err => {
        console.warn("Webhook failed:", err.message);
      });
    }
    
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
