import { useEffect, useState } from "react";
const API_KEY = import.meta.env.VITE_GIPHY_API;

const useFetch = ({keyword}) =>{
    const [gifUrl, setGifUrl]= useState("");
    const [prevKeyword, setPrevKeyword] = useState("");
    const fetchGifs = async () =>{
        try {
            // Sử dụng từ khóa để tìm GIF liên quan
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${keyword.split("").join("")}&limit=1`)
            
            const { data } = await response.json();
            // Lấy URL của GIF đầu tiên từ kết quả
            setGifUrl(data[0]?.images?.downsized_medium?.url)
        } catch (error) {
            // su dung gif mac dinh khi 429
            setGifUrl("https://i.pinimg.com/originals/73/d3/a1/73d3a14d212314ab1f7268b71d639c15.gif")
            // neu bi loi 429, chuyen sang xai gif mac dinh
            if (error.message.includes("429")) {
                console.warn("Rate limit exceeded — switching to fallback GIF");
            }
                setGifUrl("https://i.pinimg.com/originals/73/d3/a1/73d3a14d212314ab1f7268b71d639c15.gif");
        }
    }
    // Chỉ fetch khi từ khóa thay đổi
    useEffect(() =>{
        // if(keyword) fetchGifs();
          if (keyword && keyword !== prevKeyword) {
            fetchGifs();
            setPrevKeyword(keyword);
          }
    }, [keyword]);

    return gifUrl;
}

export default useFetch;