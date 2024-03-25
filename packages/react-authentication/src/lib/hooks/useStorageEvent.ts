import { useEffect } from 'react';

import { SessionService } from '../services';
import { StorageKeys } from '../utils/constants';

export const useStorageEvent = globalThis.window && typeof globalThis.window.addEventListener !== 'undefined' 
	? () => {
		useEffect(() => {
			const onStorage = (e: StorageEvent) => {
				const {
					key, newValue, oldValue 
				} = e;
				if (key && oldValue && StorageKeys.includes(key) && newValue !== oldValue) {
					SessionService.authenticate();
				}
			};
			window.addEventListener('storage', onStorage, true);

			return () => {
				window.removeEventListener('storage', onStorage, true);
			};
		}, []);
	} 
	: () => {};
