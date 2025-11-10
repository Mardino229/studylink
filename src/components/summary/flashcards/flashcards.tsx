
import { useState } from "react";
import type { ComponentProps } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import Stack from "../../ui/stack.tsx";
import { cn } from "../../../lib/utils.ts";

const Flashcard = ({
	question,
	answer,
	className,
	cardNumber,
	totalCards,
}: {
	question: string;
	answer: string;
	cardNumber: number;
	totalCards: number;
} & ComponentProps<"div">) => {
	const [isFlipped, setIsFlipped] = useState(false);

	return (
		<div
			className="w-full h-full cursor-pointer"
			onClick={(e) => {
				e.stopPropagation();
				setIsFlipped(!isFlipped);
			}}
			style={{ perspective: 1000 }}
		>
			<div
				className="relative w-full h-full transition-transform duration-700"
				style={{
					transformStyle: "preserve-3d",
					transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
				}}
			>
				{/* Face avant (Question) */}
				<div
					className={cn(
						"absolute w-full h-full p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg",
						className
					)}
					style={{ backfaceVisibility: "hidden" }}
				>
					<div className="absolute top-4 right-4 text-xs font-medium opacity-60">
						{cardNumber}/{totalCards}
					</div>
					<h3 className="text-sm font-medium mb-2 opacity-70">QUESTION</h3>
					<p className="text-lg font-semibold leading-relaxed">{question}</p>
				</div>
				{/* Face arrière (Réponse) */}
				<div
					className={cn(
						"absolute w-full h-full p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg",
						className
					)}
					style={{
						backfaceVisibility: "hidden",
						transform: "rotateY(180deg)",
					}}
				>
					<div className="absolute top-4 right-4 text-xs font-medium opacity-60">
						{cardNumber}/{totalCards}
					</div>
					<h3 className="text-sm font-medium mb-2 opacity-70">RÉPONSE</h3>
					<p className="text-lg font-semibold leading-relaxed">{answer}</p>
				</div>
			</div>
		</div>
	);
};

const cardsData = [
	{
		id: 1,
		question: "Quelle est la capitale de la France ?",
		answer: "Paris",
		color: "bg-blue-500 text-white",
	},
	{
		id: 2,
		question: "Combien font 15 × 8 ?",
		answer: "120",
		color: "bg-green-500 text-white",
	},
	{
		id: 3,
		question: "Qui a écrit 'Les Misérables' ?",
		answer: "Victor Hugo",
		color: "bg-purple-500 text-white",
	},
	{
		id: 4,
		question: "Quelle est la formule chimique de l'eau ?",
		answer: "H₂O",
		color: "bg-red-500 text-white",
	},
	{
		id: 5,
		question: "En quelle année a eu lieu la Révolution française ?",
		answer: "1789",
		color: "bg-orange-500 text-white",
	},
];

export const StackPreview = () => {
	const [cards, setCards] = useState(() =>
		cardsData.map((card, index) => ({
			id: card.id,
			content: (
				<Flashcard
					question={card.question}
					answer={card.answer}
					className={card.color}
					cardNumber={index + 1}
					totalCards={cardsData.length}
				/>
			),
		}))
	);
	const [isAnimating, setIsAnimating] = useState(false);
	const [animationDirection, setAnimationDirection] = useState<'next' | 'prev' | null>(null);

	const handleNext = () => {
		if (isAnimating) return;
		
		setIsAnimating(true);
		setAnimationDirection('next');
		
		// Déplace immédiatement la carte du dessus vers le début
		setCards((prev) => {
			const newCards = [...prev];
			const topCard = newCards.pop(); // Retire la dernière (carte du dessus)
			if (topCard) {
				newCards.unshift(topCard); // La met au début
			}
			return newCards;
		});
		
		// Reset animation après un délai
		setTimeout(() => {
			setIsAnimating(false);
			setAnimationDirection(null);
		}, 300);
	};

	const handlePrevious = () => {
		if (isAnimating) return;
		
		setIsAnimating(true);
		setAnimationDirection('prev');
		
		// Déplace la première carte vers la fin (carte précédente revient au dessus)
		setCards((prev) => {
			const newCards = [...prev];
			const firstCard = newCards.shift(); // Retire la première
			if (firstCard) {
				newCards.push(firstCard); // La met à la fin
			}
			return newCards;
		});
		
		// Reset animation après un délai
		setTimeout(() => {
			setIsAnimating(false);
			setAnimationDirection(null);
		}, 300);
	};

	return (
		<>
			{/* CSS Animations */}
			<style>{`
				@keyframes slideUp {
					0% { transform: translateY(0) scale(1); opacity: 1; }
					30% { transform: translateY(-8px) scale(0.98); opacity: 0.9; }
					100% { transform: translateY(-25px) scale(0.95); opacity: 0; }
				}
				@keyframes slideDown {
					0% { transform: translateY(0) scale(1); opacity: 1; }
					30% { transform: translateY(8px) scale(0.98); opacity: 0.9; }
					100% { transform: translateY(25px) scale(0.95); opacity: 0; }
				}
			`}</style>
			
			<div className="relative">
				{/* Layout Desktop: boutons sur les côtés */}
				<div className="hidden md:flex items-center justify-center gap-8">
					{/* Bouton Précédent Desktop */}
					<button
						onClick={handlePrevious}
						disabled={isAnimating}
						className={`flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 ${
							isAnimating ? 'opacity-50 cursor-not-allowed' : ''
						}`}
						aria-label="Carte précédente"
					>
						<ChevronLeft className="w-6 h-6 text-gray-600" />
					</button>

					{/* Stack de cartes Desktop */}
					<div className="relative">
					<div 
						className={`transition-all duration-300 ease-out ${
							isAnimating 
								? 'scale-[0.98]' 
								: ''
						}`}
					>
						<Stack
							randomRotation={true}
							cardHeight={320}
							cardWidth={280}
							cardsData={cards}
							onSendToBack={(id) => {
								// Quand on glisse une carte, on fait la même chose que le bouton suivant
								setCards((prev) => {
									const newCards = [...prev];
									const index = newCards.findIndex((card) => card.id === id);
									const [card] = newCards.splice(index, 1);
									newCards.unshift(card);
									return newCards;
								});
							}}
						/>
					</div>
					
					{/* Animation overlay pour simuler le mouvement de carte Desktop */}
					{isAnimating && (
						<div className="absolute inset-0 pointer-events-none">
							<div 
								className={`absolute w-full h-full ${
									animationDirection === 'next'
										? 'animate-[slideUp_0.5s_ease-out]'
										: 'animate-[slideDown_0.5s_ease-out]'
								}`}
								style={{
									background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
									borderRadius: '16px',
									border: '1px solid rgba(59, 130, 246, 0.15)',
									boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
								}}
							/>
						</div>
					)}
					
					{/* Indicateur de flip au centre Desktop */}
					<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
						<RotateCcw className="w-3 h-3" />
						<span>Cliquez pour retourner</span>
					</div>
				</div>

				{/* Bouton Suivant Desktop */}
				<button
					onClick={handleNext}
					disabled={isAnimating}
					className={`flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 ${
						isAnimating ? 'opacity-50 cursor-not-allowed' : ''
					}`}
					aria-label="Carte suivante"
				>
					<ChevronRight className="w-6 h-6 text-gray-600" />
				</button>
			</div>

			{/* Layout Mobile: boutons en haut et en bas */}
			<div className="md:hidden relative flex flex-col items-center">
				{/* Bouton Précédent Mobile (en haut) */}
				<button
					onClick={handlePrevious}
					disabled={isAnimating}
					className={`flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 mb-6 ${
						isAnimating ? 'opacity-50 cursor-not-allowed' : ''
					}`}
					aria-label="Carte précédente"
				>
					<ChevronLeft className="w-6 h-6 text-gray-600 rotate-90" />
				</button>

				{/* Stack de cartes Mobile */}
				<div className="relative">
					<div 
						className={`transition-all duration-300 ease-out ${
							isAnimating 
								? 'scale-[0.98]' 
								: ''
						}`}
					>
						<Stack
							randomRotation={true}
							cardHeight={280}
							cardWidth={250}
							cardsData={cards}
							onSendToBack={(id) => {
								// Quand on glisse une carte, on fait la même chose que le bouton suivant
								setCards((prev) => {
									const newCards = [...prev];
									const index = newCards.findIndex((card) => card.id === id);
									const [card] = newCards.splice(index, 1);
									newCards.unshift(card);
									return newCards;
								});
							}}
						/>
					</div>
					
					{/* Animation overlay pour simuler le mouvement de carte Mobile */}
					{isAnimating && (
						<div className="absolute inset-0 pointer-events-none">
							<div 
								className={`absolute w-full h-full ${
									animationDirection === 'next'
										? 'animate-[slideUp_0.5s_ease-out]'
										: 'animate-[slideDown_0.5s_ease-out]'
								}`}
								style={{
									background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
									borderRadius: '16px',
									border: '1px solid rgba(59, 130, 246, 0.15)',
									boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
								}}
							/>
						</div>
					)}
					
					{/* Indicateur de flip au centre Mobile */}
					<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
						<RotateCcw className="w-3 h-3" />
						<span>Cliquez pour retourner</span>
					</div>
				</div>

				{/* Bouton Suivant Mobile (en bas) */}
				<button
					onClick={handleNext}
					disabled={isAnimating}
					className={`flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200 mt-6 ${
						isAnimating ? 'opacity-50 cursor-not-allowed' : ''
					}`}
					aria-label="Carte suivante"
				>
					<ChevronRight className="w-6 h-6 text-gray-600 rotate-90" />
				</button>
			</div>
		</div>
		</>
	);
};

export default StackPreview;
