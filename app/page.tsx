'use client'
import axios from "axios"
import { useState, useEffect } from "react"

export default function Home() {
  const [favorites, setFavorites] = useState<MovieData[]>([]);

  function handleFavorite(type: 'add' | 'del', data: MovieData): void {
    if (type === 'add' && favorites.map(i => i.id).indexOf(data.id) === -1) {
      setFavorites([...favorites, data]);
    } else if (type === 'del' && favorites.map(i => i.id).indexOf(data.id) !== -1) {
      setFavorites(favorites.filter(item => item.id !== data.id));
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

function Search({ onFavorite }) {
  const searchUrl = "http://www.omdbapi.com/?apikey=4e811ae3&s="
  const [keyword, setKeyword] = useState("")
  const [url, setUrl] = useState(searchUrl)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    axios.get(url)
      .then((response) => {
        setLoading(false)
        setResult(response.data.Search)
      }).catch((error) => {
        console.log(error)
        setLoading(false)
      })
  }, [url])

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

function SearchResult({ data, handleFavorite }) {
  const itemList = data && data.map((v, i) => 
    <Movie key={i} data={{ id: v.imdbID, title: v.Title, year: v.Year }} onFavorite={handleFavorite} />
  )

  return (
    <ul className="grid grid-cols-4 grid-rows-auto">
      {itemList}
    </ul>
  )
}

function Movie({ data, onFavorite }) {
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

function Favorites({ list, onFavorite }) {
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
