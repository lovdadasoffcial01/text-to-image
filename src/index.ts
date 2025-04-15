export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const prompt = url.searchParams.get("prompt") || "cyberpunk cat";
    const count = parseInt(url.searchParams.get("count") || "1");

    const inputs = {
      prompt,
      num_images: count,
    };

    const response = await env.AI.run(
      "@cf/stabilityai/stable-diffusion-xl-base-1.0",
      inputs
    );

    const headers = {
      "content-type": count === 1 ? "image/png" : "application/json",
    };

    // If multiple images, return as base64-encoded JSON
    if (count > 1) {
      const encodedImages = response.map((img) =>
        `data:image/png;base64,${btoa(String.fromCharCode(...img))}`
      );
      return new Response(JSON.stringify(encodedImages), { headers });
    }

    return new Response(response, { headers });
  },
} satisfies ExportedHandler<Env>;
