import { Suspense } from 'react';

import { type BasePermissionType, type BaseUserType } from '../../types';
import AuthenticationProvider, { type AuthenticationProviderProps } from '../authenticationProvider/AuthenticationProvider';
import ErrorBoundary, { type ErrorBoundaryProps } from '../errorBoundary/ErrorBoundary';

export type AuthenticationSystemProps<
	U extends BaseUserType = BaseUserType,
	P extends BasePermissionType = BasePermissionType
> = AuthenticationProviderProps<U, P>
& ErrorBoundaryProps 
& {
	/**
	 * In case loadingComponent is undefined, the "suspense" will continue in the Suspense Tree
	 */
	loadingComponent?: boolean | React.ReactElement | React.ReactFragment | React.ReactPortal | null
};

function AuthenticationSystem<
	U extends BaseUserType = BaseUserType,
	P extends BasePermissionType = BasePermissionType
>({
	children,

	loadingComponent,

	errorComponent,
	onError,

	...authenticationProviderProps
}: AuthenticationSystemProps<U, P>) {
	return (
		<Suspense fallback={loadingComponent ?? null}>
			<ErrorBoundary
				errorComponent={errorComponent}
				onError={onError}
			>
				<AuthenticationProvider
					{...authenticationProviderProps}
				>
					<Suspense fallback={loadingComponent ?? null}>
						{ children }
					</Suspense>
				</AuthenticationProvider>
			</ErrorBoundary>
		</Suspense>
	);
};

export default AuthenticationSystem;
