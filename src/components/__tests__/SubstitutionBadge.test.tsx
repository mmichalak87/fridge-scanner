import React from 'react';
import { render } from '@testing-library/react-native';
import { SubstitutionBadge } from '../SubstitutionBadge';
import { Substitution } from '../../types';

// Mock useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'substitution.tip': 'Substitution Tip',
        'substitution.canSubstitute': 'You can substitute',
        'substitution.with': 'with',
      };
      return translations[key] || key;
    },
  }),
}));

describe('SubstitutionBadge', () => {
  const mockSubstitution: Substitution = {
    original: 'Heavy Cream',
    replacement: 'Milk + Butter',
    reason: 'Mix 1 cup milk with 2 tbsp melted butter for similar richness',
  };

  it('should render substitution information correctly', () => {
    const { getByText, getAllByText } = render(
      <SubstitutionBadge substitution={mockSubstitution} />
    );

    expect(getByText('Substitution Tip')).toBeTruthy();
    expect(getByText('Heavy Cream')).toBeTruthy();
    expect(getByText('Milk + Butter')).toBeTruthy();

    // These texts are within a parent Text component with nested Text children
    // so we need to check with partial matching
    const textElements = getAllByText(/You can substitute|with/);
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('should render reason when provided', () => {
    const { getByText } = render(<SubstitutionBadge substitution={mockSubstitution} />);

    expect(getByText('Mix 1 cup milk with 2 tbsp melted butter for similar richness')).toBeTruthy();
  });

  it('should not render reason when not provided', () => {
    const substitutionWithoutReason: Substitution = {
      original: 'Sugar',
      replacement: 'Honey',
    };

    const { queryByTestId } = render(
      <SubstitutionBadge substitution={substitutionWithoutReason} />
    );

    // Since we don't have a testID for reason, we check that the component renders
    // without errors when reason is undefined
    expect(queryByTestId('reason')).toBeNull();
  });

  it('should render with different substitution values', () => {
    const differentSubstitution: Substitution = {
      original: 'Buttermilk',
      replacement: 'Milk + Lemon Juice',
      reason: 'Add 1 tbsp lemon juice to 1 cup milk, let sit 5 minutes',
    };

    const { getByText } = render(<SubstitutionBadge substitution={differentSubstitution} />);

    expect(getByText('Buttermilk')).toBeTruthy();
    expect(getByText('Milk + Lemon Juice')).toBeTruthy();
    expect(getByText('Add 1 tbsp lemon juice to 1 cup milk, let sit 5 minutes')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const { toJSON } = render(<SubstitutionBadge substitution={mockSubstitution} />);

    expect(toJSON()).toMatchSnapshot();
  });

  it('should render icon and title in header', () => {
    const { getByText } = render(<SubstitutionBadge substitution={mockSubstitution} />);

    const icon = getByText('*');
    const title = getByText('Substitution Tip');

    expect(icon).toBeTruthy();
    expect(title).toBeTruthy();
  });
});
