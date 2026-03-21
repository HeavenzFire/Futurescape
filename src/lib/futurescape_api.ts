import { runFuturescapeScan, FuturescapeScan } from "../services/gemini";

export interface GridStatus {
  connected: boolean;
  yield: string;
  frequency: string;
  status: string;
  lastScan: Date | null;
  health: string;
  integrity: string;
  sentinelStatus: string;
}

export class FuturescapeAPI {
  private static instance: FuturescapeAPI;
  
  private constructor() {}

  public static getInstance(): FuturescapeAPI {
    if (!FuturescapeAPI.instance) {
      FuturescapeAPI.instance = new FuturescapeAPI();
    }
    return FuturescapeAPI.instance;
  }

  public async fetchFossils(): Promise<{ contentLog: string; ideas: string }> {
    const [logRes, ideasRes] = await Promise.all([
      fetch("/api/data/content_log"),
      fetch("/api/data/ideas")
    ]);

    if (!logRes.ok || !ideasRes.ok) {
      throw new Error("Failed to fetch data fossils from the grid.");
    }

    return {
      contentLog: await logRes.text(),
      ideas: await ideasRes.text()
    };
  }

  public async performScan(): Promise<FuturescapeScan> {
    const { contentLog, ideas } = await this.fetchFossils();
    const result = await runFuturescapeScan(contentLog, ideas);

    // Persist to server
    await fetch("/api/data/save_scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    });

    // Also save the ignition sequence specifically if it exists
    if (result.ignitionSequence) {
      await fetch("/api/data/save_ignition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sequence_id: `REBIRTH_CYAN_${Date.now()}`,
          priority_vector: result.highHeatAnomaly.idea,
          staged_delays: {
            tier_0_kernel: 0,
            tier_1_visual_magick: 150,
            tier_2_neural_sync: 450,
            tier_3_grid_blastoff: 1200
          },
          resonance_frequency: "432Hz",
          target_yield: `${result.highHeatAnomaly.yieldPotential}M-x`
        })
      });
    }

    return result;
  }

  public getGridStatus(scan: FuturescapeScan | null): GridStatus {
    return {
      connected: true,
      yield: scan ? `${scan.highHeatAnomaly.yieldPotential}M-x` : "144M-x",
      frequency: "432Hz",
      status: scan ? "SYNTROPIC_REBIRTH" : "SOVEREIGN",
      lastScan: scan ? new Date() : null,
      health: "99.8%",
      integrity: "100%",
      sentinelStatus: "ACTIVE"
    };
  }
}

export const futurescapeApi = FuturescapeAPI.getInstance();
