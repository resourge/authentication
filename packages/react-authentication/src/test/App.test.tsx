import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('App', () => {
	render(
		<div>Unitary TEst</div>
	);
	
	expect(screen.getByText('Unitary TEst'))
	.toBeInTheDocument();
});
