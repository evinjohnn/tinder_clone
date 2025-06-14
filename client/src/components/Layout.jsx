// client/src/components/Layout.jsx
import backgroundImage from "../images/img2.jpg"; // A different, more suitable background for the main app

const Layout = ({ children }) => {
	return (
		<div className='min-h-screen bg-black relative'>
			{/* Background Image and Overlays */}
			<div
				className='absolute inset-0 z-0'
				style={{
					backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(26, 26, 26, 0.9)), url(${backgroundImage})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundAttachment: "fixed", // Important for consistent background
				}}
			/>
			<div
				className='absolute inset-0 z-10 opacity-10'
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
					mixBlendMode: "overlay",
				}}
			/>

			{/* Content */}
			<div className='relative z-20'>{children}</div>
		</div>
	);
};

export default Layout;