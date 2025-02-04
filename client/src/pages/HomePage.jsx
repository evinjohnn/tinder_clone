import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Header } from "../components/Header";
import { useMatchStore } from "../store/useMatchStore";
import { Frown } from "lucide-react";
import SwipeArea from "../components/SwipeArea";
import SwipeFeedback from "../components/SwipeFeedback";
import { useAuthStore } from "../store/useAuthStore";

const HomePage = () => {
  const { 
    isLoadingUserProfiles, 
    getUserProfiles, 
    userProfiles, 
    subscribeToNewMatches, 
    unsubscribeFromNewMatches 
  } = useMatchStore();

  const { authUser } = useAuthStore();

  useEffect(() => {
    getUserProfiles();
  }, [getUserProfiles]);

  useEffect(() => {
    authUser && subscribeToNewMatches();
    return () => {
      unsubscribeFromNewMatches();
    };
  }, [subscribeToNewMatches, unsubscribeFromNewMatches, authUser]);

  return (
    <div 
      className="min-h-screen bg-black flex"
      style={{
        background: "linear-gradient(to bottom, #000000, #1a1a1a)",
      }}
    >
      <Sidebar />
      <div className="flex-grow flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col justify-center items-center p-4 relative">
          {userProfiles.length > 0 && !isLoadingUserProfiles && (
            <> 
              <SwipeArea /> 
              <SwipeFeedback /> 
            </>
          )}
          {userProfiles.length === 0 && !isLoadingUserProfiles && <NoMoreProfiles />}
          {isLoadingUserProfiles && <LoadingUI />}
        </main>
      </div>
    </div>
  );
};

const NoMoreProfiles = () => (
  <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl text-center">
    <Frown className="text-yellow-400 mx-auto mb-6" size={80} />
    <h2 className="text-3xl font-bold text-white mb-4">Woah there, speedy fingers!</h2>
    <p className="text-xl text-gray-400 mb-6">Bro are you OK? Maybe it's time to touch some grass.</p>
  </div>
);

const LoadingUI = () => {
  return (
    <div className="relative w-full max-w-sm h-[28rem]">
      <div className="bg-zinc-900 w-96 h-[28rem] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
        <div className="px-4 pt-4 h-3/4">
          <div className="w-full h-full bg-zinc-800 rounded-lg" />
        </div>
        <div className="bg-zinc-900 p-4">
          <div className="space-y-2">
            <div className="h-6 bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;