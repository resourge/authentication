import react from '@vitejs/plugin-react';

import { defineLibConfig } from '../../config/defineLibConfig';

// https://vitejs.dev/config/
export default defineLibConfig({
	build: {
		rollupOptions: {
			external: [
				'html-parse-stringify'
			]
		}
	},
	plugins: [react()]
});
