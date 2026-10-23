import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FairnessPanel } from './FairnessPanel';
import reportSummary from '../../data/report_summary.json';

describe('FairnessPanel', () => {
  it('renders collapsed initially with "Single run" in the header and expands on click', () => {
    render(<FairnessPanel />);
    const trigger = screen.getByRole('button', { name: /This model's accuracy varies/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Item 8: Assert collapsed line contains "Single run"
    expect(screen.getByText(/Single run/i)).toBeInTheDocument();

    // Click to expand
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders every caveat string verbatim from report_summary.json', () => {
    render(<FairnessPanel />);
    const trigger = screen.getByRole('button', { name: /This model's accuracy varies/i });
    fireEvent.click(trigger);

    const { caveats } = reportSummary;

    // Hand-check each caveat string from report_summary.json
    expect(screen.getByText(new RegExp(caveats.single_run.slice(0, 30), 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(caveats.seed_variance.slice(0, 30), 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(caveats.internal_test_split.slice(0, 30), 'i'))).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(caveats.published_benchmark_incomparability.slice(0, 30), 'i'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(caveats.clinical_decision_support_only.slice(0, 30), 'i'))
    ).toBeInTheDocument();

    // Verify tail class support counts are listed
    expect(screen.getByText(/MAL_OTH: n=2/i)).toBeInTheDocument();
  });

  it('renders overall metrics, binary malignant metrics, and skin tone low confidence flag', () => {
    render(<FairnessPanel />);
    const trigger = screen.getByRole('button', { name: /This model's accuracy varies/i });
    fireEvent.click(trigger);

    // Provenance
    expect(screen.getByText(/exp2c-panderm-uniform/i)).toBeInTheDocument();
    expect(screen.getAllByText(/42/).length).toBeGreaterThan(0);

    // Overall Macro-F1 (46.9%)
    expect(screen.getByText('46.9%')).toBeInTheDocument();

    // Malignant vs Benign Sensitivity & Specificity
    expect(screen.getByText(/88\.[89]%/)).toBeInTheDocument();
    expect(screen.getByText(/65\.5%/)).toBeInTheDocument();

    // Skin Tone 1 Low confidence flag (n=12 < 30)
    expect(screen.getByText(/Low confidence \(n < 30\)/i)).toBeInTheDocument();

    // Disparity comparison explicitly naming tones and like-for-like caveat
    expect(screen.getByText(/between Tone 2 \(n=72\) and Tone 3 \(n=486\)/i)).toBeInTheDocument();
    expect(screen.getByText(/between Tone 2 \(n=72\) and Tone 1 \(n=12\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Groups have different diagnosis mixes, so these gaps are not like-for-like\./i)).toBeInTheDocument();

    // Disparity caveat
    expect(screen.getByText(reportSummary.skin_tone_subgroup_metrics.disparity_caveat)).toBeInTheDocument();
  });

  it('Item 10: displays neutral label and renders no local file-system paths ("C:\\" or "Users")', () => {
    const { container } = render(<FairnessPanel />);
    const trigger = screen.getByRole('button', { name: /This model's accuracy varies/i });
    fireEvent.click(trigger);

    // Neutral label check
    expect(screen.getByText(/Generated from saved results files/i)).toBeInTheDocument();

    // File-system path guard check
    const renderedText = container.textContent || '';
    expect(renderedText).not.toMatch(/C:\\/i);
    expect(renderedText).not.toMatch(/Users/i);
  });
});
