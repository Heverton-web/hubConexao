import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    maxTags?: number;
}

export const TagInput: React.FC<TagInputProps> = ({
    tags,
    onChange,
    placeholder,
    maxTags = 10
}) => {
    const { t } = useLanguage();
    const [input, setInput] = useState('');

    // Default placeholder if undefined, using translation if available
    const effectivePlaceholder = placeholder || t('tags.add');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = input.trim();
        if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
            onChange([...tags, trimmed]);
            setInput('');
        }
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full">
            <div className={`
                flex flex-wrap gap-2 p-2 bg-surface rounded-lg transition-all min-h-[42px]
                focus-within:bg-page focus-within:shadow-inner
            `}>
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="flex items-center gap-1 bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-md animate-scale-in"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="hover:text-red-500 focus:outline-none"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}

                {tags.length < maxTags && (
                    <input
                        type="text"
                        className="flex-1 bg-transparent outline-none text-sm text-main placeholder-muted min-w-[120px]"
                        placeholder={tags.length === 0 ? effectivePlaceholder : ''}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={addTag}
                    />
                )}
            </div>
            <p className="text-[10px] text-muted mt-1 text-right">
                {tags.length}/{maxTags} {t('tags.count')}
            </p>
        </div>
    );
};
