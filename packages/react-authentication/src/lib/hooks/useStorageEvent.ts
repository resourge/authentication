import { useEffect } from 'react';

import { StorageKeys } from '../utils/constants';

export const useStorageEvent = globalThis.window && typeof globalThis.window.addEventListener !== 'undefined' 
	? (onStorageChange: () => void) => {
		useEffect(() => {
			const onStorage = (e: StorageEvent) => {
				const {
					key, newValue, oldValue 
				} = e;
				if (key && oldValue && StorageKeys.includes(key) && newValue !== oldValue) {
					onStorageChange();
				}
			};
			window.addEventListener('storage', onStorage, true);

			return () => {
				window.removeEventListener('storage', onStorage, true);
			};
		}, []);
	} 
	: () => {};
