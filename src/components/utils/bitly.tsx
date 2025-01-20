export async function shortenUrl(longUrl: string): Promise<string> {
    const token = process.env.BITLY_ACCESS_TOKEN;
    if (!token) {
      console.warn("Missing BITLY_ACCESS_TOKEN");
      return longUrl;
    }
    try {
      const response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ long_url: longUrl }),
      });
      if (!response.ok) {
        console.error("Bitly error:", await response.text());
        return longUrl;
      }
      const data = await response.json();
      return data.link || longUrl;
    } catch (err) {
      console.error("Bitly request failed:", err);
      return longUrl;
    }
  }