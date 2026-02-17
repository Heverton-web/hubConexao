import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from './TagInput';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Language Context
vi.mock('../contexts/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key: string) => key,
    }),
}));

describe('TagInput Component', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('renders correctly', () => {
        render(<TagInput tags={[]} onChange={mockOnChange} placeholder="Add a tag" />);
        const input = screen.getByPlaceholderText('Add a tag');
        expect(input).toBeInTheDocument();
    });

    it('adds a tag when Enter is pressed', () => {
        render(<TagInput tags={[]} onChange={mockOnChange} placeholder="Add a tag" />);
        const input = screen.getByPlaceholderText('Add a tag');

        fireEvent.change(input, { target: { value: 'New Tag' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        // The component calculates new tags based on props.tags + input
        expect(mockOnChange).toHaveBeenCalledWith(['New Tag']);
        // Note: The input value won't clear in the test unless we update props, 
        // because the component implementation calls setInput('') only if onChange is called.
        // However, since we are testing the call, that's enough.
        // Wait, setInput('') is called inside addTag().
        // So input should be cleared in the component state, but since we re-render or not?
        // In React Testing Library, state updates are batched.
        // But we are not re-rendering with new props in this test block unless we use a wrapper.
        // Verification of cleared input might require checking the input value again.
        expect(input).toHaveValue('');
    });

    it('does not add empty tags', () => {
        render(<TagInput tags={[]} onChange={mockOnChange} placeholder="Add a tag" />);
        const input = screen.getByPlaceholderText('Add a tag');

        fireEvent.change(input, { target: { value: '   ' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not add duplicate tags', () => {
        render(<TagInput tags={['Existing Tag']} onChange={mockOnChange} placeholder="Add a tag" />);
        // When tags > 0, the placeholder might be different or hidden depending on implementation?
        // looking at code: placeholder={tags.length === 0 ? effectivePlaceholder : ''}
        // So if tags > 0, placeholder is empty string.
        // We need to find input by other means or assuming empty placeholder.
        // Or just find by role 'textbox'.
        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value: 'Existing Tag' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('removes a tag when the remove button is clicked', () => {
        render(<TagInput tags={['Tag 1', 'Tag 2']} onChange={mockOnChange} />);

        // The component renders tags.
        // We can find the button near "Tag 1".
        const tag1 = screen.getByText('Tag 1');
        const removeButton = tag1.closest('span')?.querySelector('button');

        if (removeButton) {
            fireEvent.click(removeButton);
            // Expected: remove index 0 ('Tag 1'), so result is ['Tag 2']
            expect(mockOnChange).toHaveBeenCalledWith(['Tag 2']);
        } else {
            throw new Error('Remove button not found');
        }
    });
});
