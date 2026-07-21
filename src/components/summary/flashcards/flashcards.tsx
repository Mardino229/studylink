import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, Lightbulb, Bookmark } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Flashcard as FlashcardType } from "../../../utils/summary.ts";

// --- Types ---
interface FlashcardData {
	id: string;
	displayIndex: number;
	question: string;
	answer: string;
	category?: string;
	itemIndex: number;
	status?: 'review_again' | null;
}

interface FlashcardsProps {
	flashcards: FlashcardType[];
	initialIndex?: number;
	onNavigate?: (itemIndex: number) => void;
	onToggleStatus?: (itemIndex: number, newStatus: 'review_again' | null) => void;
}

// --- Utilities ---
const getFontSizeClass = (text: string) => {
	const len = text.length;
	if (len < 60) return "text-xl md:text-2xl";
	if (len < 120) return "text-lg md:text-xl";
	if (len < 200) return "text-base md:text-lg";
	return "text-sm md:text-base";
};

// --- Components ---

const Card = ({
	data,
	index,
	total,
	active,
	onSwipe,
	direction,
	onToggleStatus,
}: {
	data: FlashcardData;
	index: number;
	total: number;
	active: boolean;
	onSwipe: (direction: "left" | "right") => void;
	direction: number;
	onToggleStatus?: (itemIndex: number, newStatus: 'review_again' | null) => void;
}) => {
	const [isFlipped, setIsFlipped] = useState(false);
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-25, 25]);

	useEffect(() => {
		if (!active) setIsFlipped(false);
	}, [active]);

	const handleDragEnd = (_: unknown, info: PanInfo) => {
		if (Math.abs(info.offset.x) > 100) {
			const dir = info.offset.x > 0 ? "right" : "left";
			onSwipe(dir);
		}
	};

	const handleFlip = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsFlipped(!isFlipped);
	};

	const handleFlag = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!active) return;
		onToggleStatus?.(data.itemIndex, data.status === 'review_again' ? null : 'review_again');
	};

	const variants = {
		enter: (direction: number) => ({
			scale: 0.9,
			y: 30,
			opacity: 0,
			x: direction > 0 ? -100 : 100
		}),
		center: {
			scale: 1,
			y: 0,
			opacity: 1,
			zIndex: 10,
			x: 0
		},
		exit: (direction: number) => ({
			x: direction > 0 ? 500 : -500,
			opacity: 1,
			scale: 0.8,
			transition: { duration: 0.3 },
		}),
		stack: {
			scale: 1 - index * 0.05,
			y: index * 8,
			zIndex: 10 - index,
			opacity: 1,
		},
	};

	const isFlagged = data.status === 'review_again';

	return (
		<motion.div
			className="absolute top-0 left-0 w-full h-full cursor-pointer perspective-1000"
			style={{
				x: active ? x : 0,
				rotate: active ? rotate : 0,
				zIndex: active ? 10 : 10 - index,
			}}
			drag={active ? "x" : false}
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
				style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
			>
				{/* Front Face */}
				<div className="absolute inset-0 backface-hidden">
					<div className="w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 flex flex-col justify-between">
						<div className="flex justify-between items-start shrink-0">
							<span className={cn(
								"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
								isFlagged
									? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
									: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
							)}>
								{isFlagged && <Bookmark size={10} fill="currentColor" />}
								{isFlagged ? "À revoir" : (data.category || "Général")}
							</span>
							<div className="flex items-center gap-2">
								{active && (
									<button
										onClick={handleFlag}
										className={cn(
											"p-1.5 rounded-full transition-colors",
											isFlagged
												? "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
												: "text-slate-300 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
										)}
										title={isFlagged ? "Retirer le marquage" : "Marquer à revoir"}
									>
										<Bookmark size={14} fill={isFlagged ? "currentColor" : "none"} />
									</button>
								)}
								<span className="text-xs font-medium text-slate-400">
									{data.displayIndex} / {total}
								</span>
							</div>
						</div>

						<div className="flex-1 flex flex-col justify-center items-center text-center my-4 overflow-hidden w-full">
							<h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 shrink-0">
								Question
							</h3>
							<div className="flex-1 overflow-y-auto w-full flex items-center justify-center pr-1 custom-scrollbar">
								<p className={cn(
									"font-medium text-slate-800 dark:text-slate-100 leading-relaxed",
									getFontSizeClass(data.question)
								)}>
									{data.question}
								</p>
							</div>
						</div>

						<div className="flex justify-center shrink-0">
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
						<div className="flex justify-between items-start opacity-80 shrink-0">
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
								Réponse
							</span>
							<div className="flex items-center gap-2">
								{active && (
									<button
										onClick={handleFlag}
										className={cn(
											"p-1.5 rounded-full transition-colors",
											isFlagged
												? "text-amber-300 bg-white/20"
												: "text-white/40 hover:text-amber-300 hover:bg-white/20"
										)}
										title={isFlagged ? "Retirer le marquage" : "Marquer à revoir"}
									>
										<Bookmark size={14} fill={isFlagged ? "currentColor" : "none"} />
									</button>
								)}
								<span className="text-xs font-medium">
									{data.displayIndex} / {total}
								</span>
							</div>
						</div>

						<div className="flex-1 flex flex-col justify-center items-center text-center my-4 overflow-hidden w-full">
							<Lightbulb className="w-6 h-6 mb-2 text-yellow-300 opacity-80 shrink-0" />
							<div className="flex-1 overflow-y-auto w-full flex items-center justify-center pr-1 custom-scrollbar-white">
								<p className={cn(
									"font-bold leading-relaxed",
									getFontSizeClass(data.answer)
								)}>
									{data.answer}
								</p>
							</div>
						</div>

						<div className="flex justify-center opacity-60 shrink-0">
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

export const StackPreview = ({ flashcards, initialIndex = 0, onNavigate, onToggleStatus }: FlashcardsProps) => {
	const buildData = (fcs: FlashcardType[]): FlashcardData[] =>
		fcs.map((fc, index) => ({
			id: `${fc.id}-init-${index}`,
			displayIndex: index + 1,
			question: fc.question,
			answer: fc.answer,
			itemIndex: fc.itemIndex ?? index,
			status: fc.status,
			category: undefined,
		}));

	const [cards, setCards] = useState<FlashcardData[]>(() => {
		const data = buildData(flashcards);
		return initialIndex > 0 ? [...data.slice(initialIndex), ...data.slice(0, initialIndex)] : data;
	});
	const [direction, setDirection] = useState(0);

	// Keep a ref to current cards so handleSwipe can read the next top without stale closure
	const cardsRef = useRef(cards);
	useEffect(() => { cardsRef.current = cards; }, [cards]);

	const handleToggleStatus = useCallback((itemIndex: number, newStatus: 'review_again' | null) => {
		setCards(prev => prev.map(card =>
			card.itemIndex === itemIndex ? { ...card, status: newStatus } : card
		));
		onToggleStatus?.(itemIndex, newStatus);
	}, [onToggleStatus]);

	const handleSwipe = useCallback((dir: "left" | "right") => {
		const uniqueSuffix = Math.random().toString(36).substring(2, 9);
		const current = cardsRef.current;

		if (dir === "left") {
			setDirection(-1);
			// Next top card is current[1]
			const nextItemIndex = current[1]?.itemIndex ?? current[0]?.itemIndex ?? 0;
			onNavigate?.(nextItemIndex);
			setCards((prev) => {
				const newCards = [...prev];
				const topCard = newCards.shift();
				if (topCard) {
					newCards.push({ ...topCard, id: `${topCard.id.split('-')[0]}-${uniqueSuffix}` });
				}
				return newCards;
			});
		} else {
			setDirection(1);
			// Next top card is current[last]
			const nextItemIndex = current[current.length - 1]?.itemIndex ?? current[0]?.itemIndex ?? 0;
			onNavigate?.(nextItemIndex);
			setCards((prev) => {
				const newCards = [...prev];
				const lastCard = newCards.pop();
				if (lastCard) {
					newCards.unshift({ ...lastCard, id: `${lastCard.id.split('-')[0]}-${uniqueSuffix}` });
				}
				return newCards;
			});
		}
	}, [onNavigate]);

	const handleNext = () => handleSwipe("left");
	const handlePrev = () => handleSwipe("right");

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") handleNext();
			if (e.key === "ArrowLeft") handlePrev();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const visibleCards = cards.slice(0, 3);

	if (flashcards.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16">
				<p className="text-gray-500 dark:text-gray-400">Aucune flashcard disponible.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center w-full py-6 select-none">
			<div className="relative w-[90%] md:w-[100%] max-w-xl h-[420px] sm:h-[400px] md:h-[450px] flex justify-center items-center">
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
							onToggleStatus={handleToggleStatus}
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

				<div className="flex flex-col items-center gap-2">
					<span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
						{cards.length > 0 ? cards[0].displayIndex : 0} / {cards.length}
					</span>
					<div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
						<div
							className="h-full bg-blue-500 transition-all duration-300 ease-out"
							style={{
								width: `${cards.length > 0 ? (cards[0].displayIndex / cards.length) * 100 : 0}%`,
							}}
						/>
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

				.custom-scrollbar::-webkit-scrollbar {
					width: 4px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: transparent;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(156, 163, 175, 0.4);
					border-radius: 9999px;
				}
				.dark .custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(156, 163, 175, 0.2);
				}

				.custom-scrollbar-white::-webkit-scrollbar {
					width: 4px;
				}
				.custom-scrollbar-white::-webkit-scrollbar-track {
					background: transparent;
				}
				.custom-scrollbar-white::-webkit-scrollbar-thumb {
					background: rgba(255, 255, 255, 0.4);
					border-radius: 9999px;
				}
			`}</style>
		</div>
	);
};

export default StackPreview;
