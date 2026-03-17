import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./Pages/Home";
import Editor from './Pages/editor';
import Link from './Pages/Link';
import Cluster from './Pages/Cluster';
import Notes from './Pages/Notes';
import Docs from './Pages/Docs';
import Viewer from './Pages/Viewer';
import GetStarted from './Pages/getStarted';
import AuthSuccess from './Pages/authSuccess';
import LandingPage from './Pages/LandingPage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/links" element={<Link />} />
          <Route path="/clusters" element={<Cluster />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/viewer" element={<Viewer />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/notebook/:id" element={<Viewer />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
