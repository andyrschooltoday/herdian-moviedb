'use client'
import axios from "axios"
import { useState, useEffect } from "react"

interface MovieData {
  id: string;
  title: string;
  year: string;
}

interface SearchResultData {
  imdbID: string;
  Title: string;
  Year: string;
  Search?: any
}

interface SearchProps {
  onFavorite: (type: 'add' | 'del', data: MovieData) => void;
}

interface MovieProps {
  data: MovieData;
  onFavorite: (type: 'add' | 'del', data: MovieData) => void;
}

interface FavoritesProps {
  list: MovieData[];
  onFavorite: (type: 'add' | 'del', data: MovieData) => void;
}

export default function Home() {
  const [favorites, setFavorites] = useState<MovieData[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites) as MovieData[]
        setFavorites(parsed)
      } catch (e) {
        console.error('Error parsing favorites:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }
  }, [favorites, mounted])

  function handleFavorite(type: 'add' | 'del', data: MovieData) {
    if (type === "add" && favorites.map(i => i.id).indexOf(data.id) === -1) {
      setFavorites([...favorites, data])
    } else if (type === "del" && favorites.map(i => i.id).indexOf(data.id) !== -1) {
      setFavorites(favorites.filter(f => f.id !== data.id))
    }
  }

  useEffect(() => {
    const favoriteList = JSON.parse(localStorage.getItem("favorites"))
    if (favoriteList != null) {
      if (favoriteList != favorites) {
        localStorage.setItem("favorites", JSON.stringify(favorites))
      } else {
        setFavorites(favoriteList)
      }
    } else {
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }
  }, [favorites])


  return (
    <div className="font-sans flex flex-col justify-center items-center min-h-screen p-8">
      <Search onFavorite={handleFavorite} />
      <Favorites list={favorites} onFavorite={handleFavorite} />
    </div>
  );
}

function Search({ onFavorite }: SearchProps) {
  const searchUrl = "http://www.omdbapi.com/?apikey=4e811ae3&s="
  const [keyword, setKeyword] = useState("")
  const [url, setUrl] = useState(searchUrl)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResultData[] | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<{ Search: SearchResultData[] }>(url)
        setResult(response.data.Search || null)
      } catch (error) {
        console.error(error)
        setResult(null)
      } finally {
        setLoading(false)
      }
    }

    if (url !== searchUrl) {
      fetchData()
    }
  }, [url, searchUrl])

  return (
    <div>
      <form className="flex justify-center items-center" onSubmit={(e) => {
            e.preventDefault()
            setLoading(true)
            setUrl(searchUrl + keyword)
          }}>
        <label>
          <span>Search: </span>
          <input className="border border-solid border-white" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </label>
        <button 
          className="border border-solid border-white" 
          >Search
        </button>
      </form>
      {loading
        ? 
          <p>Loading...</p>
        :
          <SearchResult data={result} handleFavorite={onFavorite} />
      }
    </div>
  )
}

function SearchResult({ data, handleFavorite }: { data: any[], handleFavorite: (type: 'add' | 'del', data: MovieData) => void }) {
  if (!data) return null

  const itemList = data.map((v) => (
    <Movie 
      key={v.imdbID} 
      data={{ 
        id: v.imdbID, 
        title: v.Title, 
        year: v.Year 
      }} 
      onFavorite={handleFavorite} 
    />
  ))

  return (
    <ul className="grid grid-cols-4 grid-rows-auto">
      {itemList}
    </ul>
  )
}

function Movie({ data, onFavorite }: MovieProps) {
  const imgUrl = "https://img.omdbapi.com/?apikey=4e811ae3&i="

  return (
    <li className="border border-white border-solid flex flex-col justify-end items-center">
      <div>
        <img src={imgUrl + data.id} alt="Movie Poster" />
      </div>
      <h1>{data.title}</h1>
      <p>{data.year}</p>
      <div><button className="hover:text-red-500" onClick={() => onFavorite("add", data)}>Add to Favorite</button></div>
      <div><button className="hover:text-red-500" onClick={() => onFavorite("del", data)}>Remove from Favorite</button></div>
    </li>
  )
}

function Favorites({ list, onFavorite }: FavoritesProps) {
  const itemList = list && list.map((v, i) => 
    <Movie key={i} data={{ id: v.id, title: v.title, year: v.year }} onFavorite={onFavorite} />
  )

  return (
    <div className="flex flex-col justify-center items-center mt-10">
      <h1 className="text-blue-500">Favorites</h1>
      <ul className="grid grid-cols-4 grid-rows-auto">
        {itemList}
      </ul>
    </div>
  )
}
