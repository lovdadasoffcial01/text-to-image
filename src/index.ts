export interface Env {
  AI: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const prompt = url.searchParams.get("prompt"); // Users provide their own prompt
      if (!prompt) {
        throw new Error("Prompt parameter is required.");
      }

      const count = Math.max(1, Math.min(parseInt(url.searchParams.get("count") || "1"), 10)); // Limit images per request

      const inputs = {
        prompt,
        num_images: count,
      };

      const response = await env.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", inputs);

      if (!response || !Array.isArray(response) || response.length === 0) {
        throw new Error("Invalid response from AI model.");
      }

      const headers = {
        "Content-Type": "application/json",
      };

      const encodedImages = response.map((img: Uint8Array) => {
        return `data:image/png;base64,${Buffer.from(img).toString("base64")}`;
      });

      return new Response(JSON.stringify({ prompt, images: encodedImages }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
} satisfies ExportedHandler<Env>;
