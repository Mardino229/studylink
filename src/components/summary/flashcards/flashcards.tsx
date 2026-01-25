import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, Lightbulb } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Flashcard as FlashcardType } from "../../../utils/summary.ts";

// --- Types ---
interface FlashcardData {
	id: number;
	question: string;
	answer: string;
	category?: string;
}

interface FlashcardsProps {
	flashcards: FlashcardType[];
}

// --- Components ---

const Card = ({
	data,
	index,
	total,
	active,
	onSwipe,
	direction,
}: {
	data: FlashcardData;
	index: number;
	total: number;
	active: boolean;
	onSwipe: (direction: "left" | "right") => void;
	direction: number;
}) => {
	const [isFlipped, setIsFlipped] = useState(false);
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-25, 25]);
	// Removed opacity transform as requested

	// Reset flip when card becomes active or inactive (though key change handles most)
	useEffect(() => {
		if (!active) setIsFlipped(false);
	}, [active]);

	const handleDragEnd = (_: any, info: PanInfo) => {
		if (Math.abs(info.offset.x) > 100) {
			const dir = info.offset.x > 0 ? "right" : "left";
			onSwipe(dir);
		}
	};

	const handleFlip = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsFlipped(!isFlipped);
	};

	// Variants for entry/exit animations
	const variants = {
		enter: (direction: number) => ({
			scale: 0.9,
			y: 30,
			opacity: 0,
			x: direction > 0 ? -100 : 100 // Enter from left when going right
		}),
		center: {
			scale: 1,
			y: 0,
			opacity: 1,
			zIndex: 10,
			x: 0
		},
		exit: (direction: number) => ({
			x: direction > 0 ? 500 : -500, // Exit to the right when swiping right
			opacity: 1, // Keep opacity 1 as requested
			scale: 0.8,
			transition: { duration: 0.3 },
		}),
		stack: (i: number) => ({
			scale: 1 - i * 0.05,
			y: 0,
			zIndex: 10 - i,
			opacity: 1, // Keep opacity 1 as requested
		}),
	};

	// Only the top card is draggable
	const isDraggable = active;

	return (
		<motion.div
			className="absolute top-0 left-0 w-full h-full cursor-pointer perspective-1000"
			style={{
				x: isDraggable ? x : 0,
				rotate: isDraggable ? rotate : 0,
				zIndex: active ? 10 : 10 - index,
			}}
			drag={isDraggable ? "x" : false}
			dragConstraints={{ left: 0, right: 0 }}
			dragElastic={0.7}
			onDragEnd={handleDragEnd}
			initial="enter"
			animate={active ? "center" : "stack"}
			exit="exit"
			custom={direction}
			variants={variants}
			transition={{ type: "spring", stiffness: 300, damping: 25 }}
			onClick={handleFlip}
		>
			<div
				className="relative w-full h-full transition-transform duration-500 transform-style-3d"
				style={{
					transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
				}}
			>
				{/* Front Face */}
				<div className="absolute inset-0 backface-hidden">
					<div className="w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 flex flex-col justify-between">
						<div className="flex justify-between items-start">
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
								{data.category || "Général"}
							</span>
							<span className="text-xs font-medium text-slate-400">
								{data.id} / {total}
							</span>
						</div>

						<div className="flex-1 flex flex-col justify-center items-center text-center">
							<h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
								Question
							</h3>
							<p className="text-lg md:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
								{data.question}
							</p>
						</div>

						<div className="flex justify-center">
							<div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
								<RotateCcw className="w-3 h-3" />
								<span>Cliquer pour retourner</span>
							</div>
						</div>
					</div>
				</div>

				{/* Back Face */}
				<div
					className="absolute inset-0 backface-hidden"
					style={{ transform: "rotateY(180deg)" }}
				>
					<div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-xl p-6 md:p-8 flex flex-col justify-between text-white">
						<div className="flex justify-between items-start opacity-80">
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
								Réponse
							</span>
							<span className="text-xs font-medium">
								{data.id} / {total}
							</span>
						</div>

						<div className="flex-1 flex flex-col justify-center items-center text-center">
							<Lightbulb className="w-6 h-6 md:w-8 md:h-8 mb-4 text-yellow-300 opacity-80" />
							<p className="text-lg md:text-2xl font-bold leading-relaxed">
								{data.answer}
							</p>
						</div>

						<div className="flex justify-center opacity-60">
							<div className="flex items-center gap-2 text-xs">
								<RotateCcw className="w-3 h-3" />
								<span>Cliquer pour revenir</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export const StackPreview = ({ flashcards }: FlashcardsProps) => {
	// Convertir les flashcards de l'API en format FlashcardData
	const cardsData: FlashcardData[] = flashcards.map(fc => ({
		id: fc.id,
		question: fc.question,
		answer: fc.answer,
		category: undefined
	}));

	const [cards, setCards] = useState<FlashcardData[]>(cardsData);
	const [direction, setDirection] = useState(0); // 1 for right, -1 for left

	// Mettre à jour les cartes quand les flashcards changent
	useEffect(() => {
		const newCardsData = flashcards.map(fc => ({
			id: fc.id,
			question: fc.question,
			answer: fc.answer,
			category: undefined
		}));
		setCards(newCardsData);
	}, [flashcards]);

	// Si pas de flashcards, afficher un message
	if (flashcards.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16">
				<p className="text-gray-500 dark:text-gray-400">Aucune flashcard disponible pour ce résumé.</p>
			</div>
		);
	}

	const handleSwipe = useCallback((_dir: "left" | "right") => {
		// Always move right (positive direction) for next card
		setDirection(1);
		setCards((prev) => {
			const newCards = [...prev];
			const topCard = newCards.shift();
			if (topCard) {
				newCards.push(topCard);
			}
			return newCards;
		});
	}, []);

	const handleNext = () => handleSwipe("right");
	const handlePrev = () => {
		setDirection(-1); // Previous usually implies going back, but visually we might want to slide the other way? 
		// Actually, if we are cycling, "Previous" might mean bringing the last card to the front.
		// But the user asked for "same animation as swipe". 
		// If "Next" swipes right, "Previous" should probably swipe left or bring card from left.
		// Let's stick to the requested behavior: "Next" button does same as swipe right.

		// Wait, "Previous" button logic in the original code was: take last card and put it at front.
		// If we want consistent animation, we need to decide what "Previous" looks like.
		// If "Next" exits the current card to the right.
		// Then "Previous" should probably enter a card from the left?
		// For now, let's keep the logic but fix the direction state so the exit animation (if any) is correct.
		// But "Previous" ADDS a card to the top, so it's an ENTER animation, not EXIT.

		setCards((prev) => {
			const newCards = [...prev];
			const lastCard = newCards.pop();
			if (lastCard) {
				newCards.unshift(lastCard);
			}
			return newCards;
		});
	};

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") handleNext();
			if (e.key === "ArrowLeft") handlePrev();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Render only the top 3 cards for performance and visual clarity
	const visibleCards = cards.slice(0, 3);

	return (
		<div className="flex flex-col items-center justify-center w-full py-6 select-none">
			<div className="relative w-[90%] max-w-sm h-[320px] sm:h-[400px] md:h-[450px] flex justify-center items-center">
				<AnimatePresence mode="popLayout" custom={direction}>
					{visibleCards.map((card, index) => (
						<Card
							key={card.id}
							data={card}
							index={index}
							total={cards.length}
							active={index === 0}
							onSwipe={handleSwipe}
							direction={direction}
						/>
					))}
				</AnimatePresence>
			</div>

			{/* Controls */}
			<div className="flex items-center gap-4 md:gap-6 mt-8">
				<button
					onClick={handlePrev}
					className="p-3 md:p-4 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
					aria-label="Carte précédente"
				>
					<ChevronLeft className="w-6 h-6" />
				</button>

				<div className="flex flex-col items-center gap-1">
					<span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
						{cards.length > 0 ? cards[0].id : 0} / {cards.length}
					</span>
					<div className="flex gap-1">
						{cards.map((_, idx) => (
							<div
								key={idx}
								className={cn(
									"w-1.5 h-1.5 rounded-full transition-colors duration-300",
									idx === (cards.length > 0 ? cards[0].id - 1 : 0)
										? "bg-blue-500"
										: "bg-slate-200 dark:bg-slate-700"
								)}
							/>
						))}
					</div>
				</div>

				<button
					onClick={handleNext}
					className="p-3 md:p-4 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
					aria-label="Carte suivante"
				>
					<ChevronRight className="w-6 h-6" />
				</button>
			</div>

			<p className="mt-6 text-xs text-slate-400 font-medium">
				Utilisez les flèches ← → pour naviguer
			</p>

			<style>{`
				.perspective-1000 {
					perspective: 1000px;
				}
				.transform-style-3d {
					transform-style: preserve-3d;
				}
				.backface-hidden {
					backface-visibility: hidden;
				}
			`}</style>
		</div>
	);
};

export default StackPreview;
