export function OnlineGetSnapshot() {
	return globalThis.navigator === undefined
		? true
		: globalThis.navigator.onLine;
}

export const OnlineSubscribe = globalThis.window !== undefined && globalThis.window.addEventListener !== undefined
	? (callback: () => void) => {
		globalThis.addEventListener('online', callback);
		globalThis.addEventListener('offline', callback);
		return () => {
			globalThis.removeEventListener('online', callback);
			globalThis.removeEventListener('offline', callback);
		};
	}
	: () => {
		return () => {

		};
	};
