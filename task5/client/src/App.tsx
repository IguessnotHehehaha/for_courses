import { useStore } from './store/useStore'
import Toolbar from './components/Toolbar'
import TableView from './components/TableView'
import GalleryView from './components/GalleryView'
import PlayerBar from "./components/PlayerBar.tsx";

function App() {
    const viewMode = useStore((s) => s.viewMode)

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <Toolbar />
            <main className="flex-1">
                {viewMode === 'table' ? <TableView /> : <GalleryView />}
            </main>
            <PlayerBar />
        </div>
    )
}

export default App