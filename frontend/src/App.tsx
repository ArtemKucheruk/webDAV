import { Hero } from '@/pages/Hero'
import { useAnimatedFavicon } from "./hooks/useAnimatedFav";

function App() {
  useAnimatedFavicon();
  return <Hero />
}

export default App