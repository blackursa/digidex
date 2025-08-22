import React from 'react';
import { render } from '@testing-library/react-native';
import { ScanStatusOverlay } from '../ScanStatusOverlay';
import { Animated } from 'react-native';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('ScanStatusOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with scanning status', () => {
    const { getByRole } = render(<ScanStatusOverlay status="scanning" />);
    expect(getByRole('alert')).toBeTruthy();
  });

  it('applies correct color for success status', () => {
    const { getByTestId } = render(<ScanStatusOverlay status="success" />);
    const overlay = getByTestId('status-overlay');
    expect(overlay.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#4CAF50'
        })
      ])
    );
  });

  it('applies correct color for error status', () => {
    const { getByTestId } = render(<ScanStatusOverlay status="error" />);
    const overlay = getByTestId('status-overlay');
    expect(overlay.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#F44336'
        })
      ])
    );
  });

  it('applies correct color for retry status', () => {
    const { getByTestId } = render(<ScanStatusOverlay status="retry" />);
    const overlay = getByTestId('status-overlay');
    expect(overlay.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#FFC107'
        })
      ])
    );
  });

  it('starts animation for scanning status', () => {
    const startSpy = jest.spyOn(Animated, 'loop');
    render(<ScanStatusOverlay status="scanning" />);
    expect(startSpy).toHaveBeenCalled();
  });

  it('stops animation for non-scanning status', () => {
    const startSpy = jest.spyOn(Animated, 'loop');
    const { rerender } = render(<ScanStatusOverlay status="scanning" />);
    expect(startSpy).toHaveBeenCalled();

    rerender(<ScanStatusOverlay status="success" />);
    expect(startSpy).toHaveBeenCalledTimes(1);
  });
});
