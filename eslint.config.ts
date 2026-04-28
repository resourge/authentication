import reactConfig from 'eslint-config-resourge/react';
import { defineConfig } from 'eslint/config';

reactConfig.at(-1)?.files?.push('**/src/**/*.{js,ts,tsx}');
reactConfig.at(-1)?.files?.push('packages/**/vite.config.{js,ts}');

export default defineConfig(reactConfig);
