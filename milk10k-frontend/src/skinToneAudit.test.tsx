import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkinToneSelector, SKIN_TONE_CLAIM } from './components/UploadScreen/SkinToneSelector';
import { FairnessPanel } from './components/ResultScreen/FairnessPanel';

describe('Skin Tone Audit Verification (F5 Follow-up)', () => {
  it('renders skin-tone definition claim in SkinToneSelector: "As defined in the MILK10k metadata (0 = darkest, 5 = lightest); not Fitzpatrick."', () => {
    render(<SkinToneSelector value={undefined} onChange={() => {}} />);
    expect(
      screen.getByText(
        'As defined in the MILK10k metadata (0 = darkest, 5 = lightest); not Fitzpatrick.'
      )
    ).toBeInTheDocument();
    expect(SKIN_TONE_CLAIM).toBe(
      'As defined in the MILK10k metadata (0 = darkest, 5 = lightest); not Fitzpatrick.'
    );
  });

  it('renders darker skin tone disparity caution in FairnessPanel: "Tone 0 has no test lesions and Tone 1 has 12, so this test split cannot support conclusions about performance on darker skin."', () => {
    render(<FairnessPanel />);
    const trigger = screen.getByRole('button', { name: /This model's accuracy varies/i });
    fireEvent.click(trigger);
    expect(
      screen.getByText(
        'Tone 0 has no test lesions and Tone 1 has 12, so this test split cannot support conclusions about performance on darker skin.'
      )
    ).toBeInTheDocument();
  });
});
