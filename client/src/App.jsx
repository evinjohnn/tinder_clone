// client/src/App.jsx
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import LikesYouPage from "./pages/LikesYouPage";
import ChatListPage from "./pages/ChatPage"; // This is the list of chats
import ConversationPage from "./pages/ConversationPage"; // This is the individual chat room
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

function App() {
	const { checkAuth, authUser, checkingAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	// FIX: Show a full-screen loader while checking auth status
	if (checkingAuth) {
		return (
			<div className="h-screen w-screen bg-black flex items-center justify-center">
				<Loader2 className="animate-spin text-yellow-400" size={48} />
			</div>
		);
	}

	return (
		<>
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to={"/auth"} />} />
                <Route path='/likes' element={authUser ? <LikesYouPage /> : <Navigate to={"/auth"} />} />
				<Route path='/chat' element={authUser ? <ChatListPage /> : <Navigate to={"/auth"} />} />
				<Route path='/chat/:id' element={authUser ? <ConversationPage /> : <Navigate to={"/auth"} />} />
				<Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to={"/auth"} />} />
				<Route path='/auth' element={!authUser ? <AuthPage /> : <Navigate to={"/"} />} />
			</Routes>
			<Toaster position="top-center" toastOptions={{
                style: { background: '#333', color: '#fff' }
            }}/>
		</>
	);
}

export default App;