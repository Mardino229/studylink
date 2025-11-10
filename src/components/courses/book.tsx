
import { BookIcon } from "lucide-react";
import {ModernBookCover,
    BookHeader,
    BookTitle,} from "../ui/modern-book-cover.tsx";

export function ModernBookCoverPreview() {
    return (
        <div className="flex flex-wrap sm:gap-8 gap-5 sm:justify-start justify-center ">
            <ModernBookCover size="sm" color="emerald">
                <BookHeader>
                    <BookIcon size={20} />
                </BookHeader>
                <BookTitle>Math</BookTitle>
            </ModernBookCover>
            <ModernBookCover size="sm" color="teal">
                <BookHeader>
                    <BookIcon size={20} />
                </BookHeader>
                <BookTitle>Phylosophy</BookTitle>
            </ModernBookCover><ModernBookCover size="sm" color="orange">
                <BookHeader>
                    <BookIcon size={20} />
                </BookHeader>
                <BookTitle>Science de la vie et de le terre</BookTitle>
            </ModernBookCover><ModernBookCover size="sm" color="orange">
                <BookHeader>
                    <BookIcon size={20} />
                </BookHeader>
                <BookTitle>Phylosophy</BookTitle>
            </ModernBookCover><ModernBookCover size="sm" color="blue">
                <BookHeader>
                    <BookIcon size={20} />
                </BookHeader>
                <BookTitle>Phylosophy</BookTitle>
            </ModernBookCover><ModernBookCover size="sm" color="green">
                <BookHeader>
                    <BookIcon size={20} />
                </BookHeader>
                <BookTitle>Phylosophy</BookTitle>
            </ModernBookCover><ModernBookCover size="sm" color="rose">
                <BookHeader>
                    <BookIcon size={20} />
                </BookHeader>
                <BookTitle>Phylosophy</BookTitle>
            </ModernBookCover><ModernBookCover size="sm" color="red">
                <BookHeader>
                    <BookIcon size={20} />
                </BookHeader>
                <BookTitle>Phylosophy</BookTitle>
            </ModernBookCover><ModernBookCover size="sm" color="amber">
                <BookHeader>
                    <BookIcon size={20} />
                </BookHeader>
                <BookTitle>Phylosophy</BookTitle>
            </ModernBookCover><ModernBookCover size="sm" color="blue">
                <BookHeader>
                    <BookIcon size={20} />
                </BookHeader>
                <BookTitle>Phylosophy</BookTitle>
            </ModernBookCover><ModernBookCover size="sm" color="blue">
                <BookHeader>
                    <BookIcon size={20} />
                </BookHeader>
                <BookTitle>Phylosophy</BookTitle>
            </ModernBookCover>
        </div>
    );
}

export default ModernBookCoverPreview;
