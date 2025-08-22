import React from 'react';
import renderer from 'react-test-renderer';
import { QRCodeDisplay } from '../QRCodeDisplay';

describe('QRCodeDisplay Snapshots', () => {
  it('renders correctly with default props', () => {
    const tree = renderer.create(
      <QRCodeDisplay 
        value="test-qr-code-data"
        size={200}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly in loading state', () => {
    const tree = renderer.create(
      <QRCodeDisplay 
        value="test-qr-code-data"
        size={200}
        isLoading={true}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with error', () => {
    const tree = renderer.create(
      <QRCodeDisplay 
        value="test-qr-code-data"
        size={200}
        error="Failed to generate QR code"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with custom size', () => {
    const tree = renderer.create(
      <QRCodeDisplay 
        value="test-qr-code-data"
        size={400}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with share button', () => {
    const mockOnShare = jest.fn();
    const tree = renderer.create(
      <QRCodeDisplay 
        value="test-qr-code-data"
        size={200}
        onShare={mockOnShare}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
