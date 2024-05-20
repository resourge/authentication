import { useSyncExternalStore } from 'react';

import { OnlineSubscribe, OnlineGetSnapshot } from '../utils/onlineUtils/OnlineUtils';

export const useIsOnline = () => {
	return useSyncExternalStore(OnlineSubscribe, OnlineGetSnapshot, OnlineGetSnapshot);
};
