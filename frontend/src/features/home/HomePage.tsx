import Button from "../../components/ui/Button/Button";
import { authService } from "../auth/services/authServices";
import { useState } from 'react'

const HomePage = () => {
    const [count, setCount] = useState(0)
    return (
        <div className="home-page">
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
            <Button onClick={authService.logout}>
                logout
            </Button>
        </div>
    )
}
export default HomePage;