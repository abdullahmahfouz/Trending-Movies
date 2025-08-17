import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Add api_key as query parameter instead of Bearer token
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          accept: 'application/json'
        }
      });

      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      setMovieList(data.results || []);

      // Temporarily comment out Appwrite until CORS is fixed
      // if(query && data.results.length > 0) {
      //   await updateSearchCount(query, data.results[0]);
      // }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    setTrendingLoading(true);
    try {
      // Fetch trending movies from TMDB API
      const endpoint = `${API_BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          accept: 'application/json'
        }
      });

      if(!response.ok) {
        throw new Error('Failed to fetch trending movies');
      }

      const data = await response.json();
      // Get only top 5 trending movies
      setTrendingMovies(data.results?.slice(0, 5) || []);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
      setTrendingMovies([]); // Set empty array on error
    } finally {
      setTrendingLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main className="flex flex-col min-h-screen relative bg-primary">
      <div className="pattern"/>
      <div className="wrapper flex-1">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* Trending Movies Section */}
        <section className="trending">
          <h2>Trending This Week</h2>
          {trendingLoading ? (
            <div className="trending-loading">
              <Spinner />
            </div>
          ) : trendingMovies && trendingMovies.length > 0 ? (
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.id}>
                  <p>{index + 1}</p>
                  {movie.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                      alt={movie.title}
                    />
                  ) : (
                    <div className="w-[127px] h-[163px] bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No trending movies available.</p>
          )}
        </section>

        <section className="all-movies">
          <h2>{debouncedSearchTerm ? `Search Results for "${debouncedSearchTerm}"` : 'All Movies'}</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
      <footer className="mt-10 py-6 text-center text-gray-100 text-sm opacity-80">
        <p>&copy; 2025 Movie App. All rights reserved. - created by Abdullah Mahfouz</p>
      </footer>
    </main>
  )
}

export default App
