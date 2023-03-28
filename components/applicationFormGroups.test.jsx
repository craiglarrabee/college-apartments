
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ApplicationFormGroups from './ApplicationFormGroups';

describe('ApplicationFormGroups component', () => {
  describe('rendering', () => {
    it('should render the Preferences label', () => {
      render(<ApplicationFormGroups />);
      const preferencesLabel = screen.getByText('Preferences:');
      expect(preferencesLabel).toBeInTheDocument();
    });

    it('should render the Preferred Roommate label', () => {
      render(<ApplicationFormGroups />);
      const roommateLabel = screen.getByLabelText('Preferred Roommate');
      expect(roommateLabel).toBeInTheDocument();
    });

    it('should render the roomate2 input', () => {
      render(<ApplicationFormGroups />);
      const roommate2Input = screen.getByPlaceholderText('Preferred Apartment Mate 1');
      expect(roommate2Input).toBeInTheDocument();
    });

    it('should render the roomate3 input', () => {
      render(<ApplicationFormGroups />);
      const roommate3Input = screen.getByPlaceholderText('Preferred Apartment Mate 2');
      expect(roommate3Input).toBeInTheDocument();
    });

    it('should render the roomate4 input', () => {
      render(<ApplicationFormGroups />);
      const roommate4Input = screen.getByPlaceholderText('Preferred Apartment Mate 3');
      expect(roommate4Input).toBeInTheDocument();
    });

    it('should render the roomate5 input', () => {
      render(<ApplicationFormGroups />);
      const roommate5Input = screen.getByPlaceholderText('Preferred Apartment Mate 4');
      expect(roommate5Input).toBeInTheDocument();
    });

    it('should render the Likes and Dislikes label', () => {
      render(<ApplicationFormGroups />);
      const likesDislikesLabel = screen.getByLabelText('Likes and Dislikes');
      expect(likesDislikesLabel).toBeInTheDocument();
    });

    it('should render the "Please do not share my information" checkbox', () => {
      render(<ApplicationFormGroups />);
      const shareInfoCheckbox = screen.getByLabelText('Please do not share my information.');
      expect(shareInfoCheckbox).toBeInTheDocument();
    });

    it('should render the Roommate Description label', () => {
      render(<ApplicationFormGroups />);
      const roommateDescLabel = screen.getByLabelText('Roommate Description');
      expect(roommateDescLabel).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    xit('should validate the "Preferred Roommate" field when typing more than 256 characters', async () => {
      render(<ApplicationFormGroups />);
      const roommateInput = screen.getByLabelText('Preferred Roommate');
      await fireEvent.input(roommateInput, 'a'.repeat(257));
      await fireEvent.blur(roommateInput);
      const errorMessage = screen.getByText('Too long.');
      expect(errorMessage).toBeInTheDocument();
    });

    it('should not validate the "Preferred Roommate" field when typing less than or equal to 256 characters', async () => {
      render(<ApplicationFormGroups />);
      const roommateInput = screen.getByLabelText('Preferred Roommate');
      await userEvent.type(roommateInput, 'a'.repeat(256));
      const errorMessage = screen.queryByText('Too long.');
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('should select the "Please do not share my information" checkbox when clicking it', async () => {
      render(<ApplicationFormGroups />);
      const shareInfoCheckbox = screen.getByLabelText('Please do not share my information.');
      expect(shareInfoCheckbox.checked).toBe(false);
      await fireEvent.click(shareInfoCheckbox);
      expect(shareInfoCheckbox.checked).toBe(true);
    });
  });
});
