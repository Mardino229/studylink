"use client";
import { motion, useMotionValue, useTransform } from "motion/react";
import { type ReactNode, useState } from "react";

function CardRotate({
                        children,
                        onSendToBack,
                        sensitivity,
                    }: {
    children: ReactNode;
    onSendToBack: () => void;
    sensitivity: number;
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [60, -60]);
    const rotateY = useTransform(x, [-100, 100], [-60, 60]);

    function handleDragEnd(
        _event: MouseEvent | TouchEvent | PointerEvent,
        info: { offset: { x: number; y: number } },
    ) {
        if (
            Math.abs(info.offset.x) > sensitivity ||
            Math.abs(info.offset.y) > sensitivity
        ) {
            onSendToBack();
        } else {
            x.set(0);
            y.set(0);
        }
    }

    return (
        <motion.div
            className="absolute cursor-grab size-full"
            style={{ x, y, rotateX, rotateY }}
            drag={true}
            dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
            dragElastic={0.6}
            whileTap={{ cursor: "grabbing" }}
            onDragEnd={handleDragEnd}
        >
            {children}
        </motion.div>
    );
}

type CardData = { id: number; content: ReactNode };

export default function Stack({
                                  randomRotation = false,
                                  sensitivity = 180,
                                  cardsData,
                                  animationConfig = { stiffness: 400, damping: 30 },
                                  cardWidth = 210,
                                  cardHeight = 210,
                                  onSendToBack,
                              }: {
    randomRotation?: boolean;
    sensitivity?: number;
    cardsData: CardData[];
    animationConfig?: { stiffness: number; damping: number };
    cardWidth?: number;
    cardHeight?: number;
    onSendToBack?: (id: number) => void;
}) {
    const [internalCards, setInternalCards] = useState(cardsData);
    
    // Utilise les cardes passées en props ou l'état interne
    const cards = onSendToBack ? cardsData : internalCards;

    const sendToBack = (id: number | string) => {
        if (onSendToBack) {
            onSendToBack(id as number);
        } else {
            setInternalCards((prev) => {
                const newCards = [...prev];
                const index = newCards.findIndex((card) => card.id === id);
                const [card] = newCards.splice(index, 1);
                newCards.unshift(card);
                return newCards;
            });
        }
    };

    return (
        <div
            className="relative"
            style={{
                perspective: 600,
                height: cardHeight,
                width: cardWidth,
            }}
        >
            {cards.map((card, index) => {
                const isTopCard = index === cards.length - 1; // La dernière carte est celle du dessus (comme avant)

                return (
                    <CardRotate
                        key={`${card.id}-${index}`}
                        onSendToBack={() => sendToBack(card.id)}
                        sensitivity={sensitivity}
                    >
                        <motion.div
                            className="absolute size-full overflow-hidden"
                            animate={{
                                rotateZ: isTopCard ? 0 : (cards.length - index - 1) * 3, // Carte du dessus droite, autres inclinées
                                scale: 1, // Toutes les cartes ont la même taille
                                transformOrigin: "50% 50%",
                            }}
                            initial={false}
                            transition={{
                                type: "spring",
                                stiffness: animationConfig.stiffness,
                                damping: animationConfig.damping,
                            }}
                            style={{
                                width: cardWidth,
                                height: cardHeight,
                            }}
                        >
                            {card.content}
                        </motion.div>
                    </CardRotate>
                );
            })}
        </div>
    );
}
