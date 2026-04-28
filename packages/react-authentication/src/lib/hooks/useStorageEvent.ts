import { useEffect } from 'react';

import { StorageKeys } from '../utils/constants';

function debounce(func: () => void, wait: number) {
	let timer: NodeJS.Timeout;
	return function() {
		clearTimeout(timer);
		timer = setTimeout(func, wait);
	};
}

export const useStorageEvent = globalThis.window && globalThis.window.addEventListener !== undefined 
	? (onStorageChange: () => void) => {
		useEffect(() => {
			const _onStorageChange = debounce(onStorageChange, 400);
			const onStorage = (e: StorageEvent) => {
				const {
					key, newValue, oldValue 
				} = e;

				if (key && StorageKeys.includes(key) && newValue !== oldValue) {
					_onStorageChange();
				}
			};
			globalThis.addEventListener('storage', onStorage, true);

			return () => {
				globalThis.removeEventListener('storage', onStorage, true);
			};
		}, []);
	} 
	: () => {};
