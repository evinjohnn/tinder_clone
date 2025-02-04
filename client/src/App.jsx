import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

function App() {
	const { checkAuth, authUser, checkingAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (checkingAuth) return null;

	return (
		<div 
			className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: `url(${require('./img2.jpg')})` }}
		>
			<div className="bg-zinc-900 p-8 rounded-lg shadow-lg w-full max-w-md">
				<Routes>
					<Route path='/' element={authUser ? <HomePage /> : <Navigate to={"/auth"} />} />
					<Route path='/auth' element={!authUser ? <AuthPage /> : <Navigate to={"/"} />} />
					<Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to={"/auth"} />} />
					<Route path='/chat/:id' element={authUser ? <ChatPage /> : <Navigate to={"/auth"} />} />
				</Routes>

				<Toaster />
			</div>
		</div>
	);
}

export default App;
