/* eslint-disable resourge-custom-react/folder-file-convention */
import { render, screen } from '@testing-library/react';

it('App', () => {
	render(
		<div>Unitary TEst</div>
	);
	
	expect(screen.getByText('Unitary TEst'))
	.toBeInTheDocument();
});
