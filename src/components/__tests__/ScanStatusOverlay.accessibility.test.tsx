import React from 'react';
import { render } from '@testing-library/react-native';
import { ScanStatusOverlay } from '../ScanStatusOverlay';
import { AccessibilityInfo } from 'react-native';

describe('ScanStatusOverlay Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has correct accessibility role', () => {
    const { getByRole } = render(<ScanStatusOverlay status="scanning" />);
    expect(getByRole('alert')).toBeTruthy();
  });

  it('is accessible to screen readers', () => {
    const { getByRole } = render(<ScanStatusOverlay status="scanning" />);
    const overlay = getByRole('alert');
    expect(overlay.props.accessibilityRole).toBe('alert');
  });

  it('has appropriate accessibility states', () => {
    const { getByRole, rerender } = render(<ScanStatusOverlay status="scanning" />);
    const overlay = getByRole('alert');

    expect(overlay.props.accessibilityState).toEqual({
      busy: true
    });

    rerender(<ScanStatusOverlay status="success" />);
    expect(overlay.props.accessibilityState).toEqual({
      busy: false
    });
  });

  it('announces status changes', () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const { rerender } = render(<ScanStatusOverlay status="scanning" />);

    rerender(<ScanStatusOverlay status="success" />);
    expect(announceSpy).toHaveBeenCalledWith('Scan successful');

    rerender(<ScanStatusOverlay status="error" />);
    expect(announceSpy).toHaveBeenCalledWith('Scan failed');

    rerender(<ScanStatusOverlay status="retry" />);
    expect(announceSpy).toHaveBeenCalledWith('Retrying scan');
  });
});
