// client/src/components/SwipeArea.jsx
import TinderCard from "react-tinder-card";
import { useMatchStore } from "../store/useMatchStore";
import { X, Heart } from "lucide-react";
import React, { useMemo, useRef, useState, useEffect } from "react"; // Import useEffect

const SwipeArea = () => {
	const { userProfiles, swipeRight, swipeLeft } = useMatchStore();
	const [currentIndex, setCurrentIndex] = useState(userProfiles.length - 1);
	const currentIndexRef = useRef(currentIndex);

	const childRefs = useMemo(
		() =>
			Array(userProfiles.length)
				.fill(0)
				.map(() => React.createRef()),
		[userProfiles.length]
	);

	// FIX: This useEffect hook synchronizes the component's internal state
	// with the userProfiles from the Zustand store. It resets the stack
	// when the profiles are loaded or updated.
	useEffect(() => {
		const newIndex = userProfiles.length - 1;
		setCurrentIndex(newIndex);
		currentIndexRef.current = newIndex;
	}, [userProfiles]);

	const updateCurrentIndex = (val) => {
		setCurrentIndex(val);
		currentIndexRef.current = val;
	};

	const canSwipe = currentIndex >= 0;

	// set last direction and decrease current index
	const swiped = (direction, user, index) => {
		if (direction === "right") {
			swipeRight(user);
		} else {
			swipeLeft(user);
		}
		updateCurrentIndex(index - 1);
	};

	const outOfFrame = (name, idx) => {
		// handle the case in which go back is pressed before card goes outOfFrame
		if (childRefs[idx].current && currentIndexRef.current >= idx) {
			childRefs[idx].current.restoreCard();
		}
	};

	const swipe = async (dir) => {
		if (canSwipe && currentIndex < userProfiles.length) {
			await childRefs[currentIndex].current.swipe(dir); // Swipe the card!
		}
	};

	return (
		<div className='flex flex-col items-center gap-8'>
			<div className='relative w-full max-w-sm h-[32rem]'>
				{userProfiles.map((user, index) => (
					<TinderCard
						ref={childRefs[index]}
						className='absolute'
						key={user._id}
						onSwipe={(dir) => swiped(dir, user, index)}
						onCardLeftScreen={() => outOfFrame(user.name, index)}
						preventSwipe={["up", "down"]}
					>
						<div
							className='
                            w-96 h-[32rem] select-none rounded-3xl overflow-hidden
                            bg-black/50 backdrop-blur-md
                            border border-zinc-700/30
                            shadow-xl shadow-black/20
                            transform transition-transform duration-300 hover:scale-[1.02]
                        '
						>
							<div className='relative h-full'>
								<img
									src={user.image || "/avatar.png"}
									alt={user.name}
									className='w-full h-full object-cover pointer-events-none'
								/>
								{/* Gradient overlay */}
								<div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent' />

								{/* User info overlay */}
								<div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
									<div className='flex items-end gap-3'>
										<h2 className='text-3xl font-bold'>{user.name}</h2>
										<span className='text-2xl font-medium text-yellow-400'>{user.age}</span>
									</div>
									<p className='text-gray-300 text-sm mt-2 line-clamp-3 h-16'>{user.bio}</p>
								</div>
							</div>
						</div>
					</TinderCard>
				))}
			</div>

			<div className='flex items-center gap-8'>
				<button
					onClick={() => swipe("left")}
					disabled={!canSwipe}
					className='p-5 rounded-full bg-zinc-800/80 backdrop-blur-lg text-red-500 border border-zinc-700
                    hover:bg-red-500/20 transition-all duration-300 disabled:opacity-50'
				>
					<X size={32} />
				</button>
				<button
					onClick={() => swipe("right")}
					disabled={!canSwipe}
					className='p-5 rounded-full bg-zinc-800/80 backdrop-blur-lg text-green-400 border border-zinc-700
                    hover:bg-green-400/20 transition-all duration-300 disabled:opacity-50'
				>
					<Heart size={32} />
				</button>
			</div>
		</div>
	);
};

export default SwipeArea;