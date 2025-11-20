
import { useEffect, useState } from "react";

const API_KEY = import.meta.env.VITE_GIPHY_API;

// SIÊU CẤP CACHE - SỐNG MÃI MÃI, KHÔNG CHẾT KỂ CẢ KHI HOT RELOAD!
if (!window.__GIPHY_CACHE__) {
  window.__GIPHY_CACHE__ = new Map();
}
const cache = window.__GIPHY_CACHE__;

const useFetch = ({ keyword }) => {
  const [gifUrl, setGifUrl] = useState("");

  useEffect(() => {
    const trimmed = (keyword || "").toString().trim().toLowerCase();

    // Keyword rỗng → fallback
    if (!trimmed) {
      setGifUrl("https://i.pinimg.com/originals/73/d3/a1/73d3a14d212314ab1f7268b71d639c15.gif");
      return;
    }

    // ĐÃ CÓ TRONG CACHE → DÙNG NGAY
    if (cache.has(trimmed)) {
      setGifUrl(cache.get(trimmed));
      return;
    }

    // CHƯA CÓ → GỌI API
    fetch(`https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(trimmed)}&limit=1&rating=pg`)
      .then(r => {
        if (r.status === 429) throw new Error("429");
        if (!r.ok) throw new Error("network");
        return r.json();
      })
      .then(({ data }) => {
        const url = data[0]?.images?.downsized_medium?.url || "https://i.pinimg.com/originals/73/d3/a1/73d3a14d212314ab1f7268b71d639c15.gif";
        cache.set(trimmed, url);
        setGifUrl(url);
      })
      .catch(err => {
        console.warn("Giphy error → fallback:", err.message);
        const fallback = "https://i.pinimg.com/originals/73/d3/a1/73d3a14d212314ab1f7268b71d639c15.gif";
        cache.set(trimmed, fallback);
        setGifUrl(fallback);
      });

  }, [keyword]);

  return gifUrl;
};

export default useFetch;