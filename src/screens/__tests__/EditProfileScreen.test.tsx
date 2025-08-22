import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { EditProfileScreen } from '../EditProfileScreen';
import { updateDoc } from '@firebase/firestore';
import { uploadProfileImage } from '../../services/storage';
import { useToast } from '../../contexts/ToastContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

jest.mock('@firebase/firestore');
jest.mock('../../services/storage');
jest.mock('../../contexts/ToastContext');
jest.mock('@react-navigation/native');
jest.mock('expo-image-picker');

describe('EditProfileScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
  };

  const mockShowToast = jest.fn();

  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    (updateDoc as jest.Mock).mockClear();
    (uploadProfileImage as jest.Mock).mockClear();
    mockShowToast.mockClear();
    mockNavigation.goBack.mockClear();
  });

  it('validates required fields', async () => {
    const { getByText, getByPlaceholderText } = render(<EditProfileScreen />);
    
    const displayNameInput = getByPlaceholderText('Display Name');
    const saveButton = getByText('Save');

    fireEvent.changeText(displayNameInput, '');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Display name is required')).toBeTruthy();
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  it('validates social media links', async () => {
    const { getByText, getByPlaceholderText } = render(<EditProfileScreen />);
    
    const linkedinInput = getByPlaceholderText('LinkedIn URL');
    const twitterInput = getByPlaceholderText('Twitter Handle');
    const githubInput = getByPlaceholderText('GitHub URL');
    const saveButton = getByText('Save');

    fireEvent.changeText(linkedinInput, 'invalid-linkedin');
    fireEvent.changeText(twitterInput, '@toolong'.repeat(10));
    fireEvent.changeText(githubInput, 'invalid-github');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Invalid LinkedIn URL')).toBeTruthy();
      expect(getByText('Twitter handle must be between 4 and 15 characters')).toBeTruthy();
      expect(getByText('Invalid GitHub URL')).toBeTruthy();
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  it('handles successful profile update', async () => {
    const { getByText, getByPlaceholderText } = render(<EditProfileScreen />);
    
    const displayNameInput = getByPlaceholderText('Display Name');
    const companyInput = getByPlaceholderText('Company');
    const titleInput = getByPlaceholderText('Title');
    const saveButton = getByText('Save');

    (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

    fireEvent.changeText(displayNameInput, 'John Doe');
    fireEvent.changeText(companyInput, 'Test Corp');
    fireEvent.changeText(titleInput, 'Engineer');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          displayName: 'John Doe',
          company: 'Test Corp',
          title: 'Engineer',
        })
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        'Profile updated successfully',
        'success'
      );
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it('handles profile image upload', async () => {
    const { getByText } = render(<EditProfileScreen />);
    
    const mockImageResult = {
      canceled: false,
      assets: [{ uri: 'file://test.jpg' }],
    };

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce(mockImageResult);
    (uploadProfileImage as jest.Mock).mockResolvedValueOnce('https://example.com/photo.jpg');

    const uploadButton = getByText('Upload Photo');
    fireEvent.press(uploadButton);

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(uploadProfileImage).toHaveBeenCalledWith('file://test.jpg');
      expect(mockShowToast).toHaveBeenCalledWith(
        'Profile photo updated',
        'success'
      );
    });
  });

  it('handles update error', async () => {
    const { getByText, getByPlaceholderText } = render(<EditProfileScreen />);
    
    const displayNameInput = getByPlaceholderText('Display Name');
    const saveButton = getByText('Save');

    (updateDoc as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

    fireEvent.changeText(displayNameInput, 'John Doe');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Failed to update profile',
        'error'
      );
      expect(mockNavigation.goBack).not.toHaveBeenCalled();
    });
  });
});
