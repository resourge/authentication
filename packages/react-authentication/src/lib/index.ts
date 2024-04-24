import {
	AuthenticationSystem,
	type AuthenticationSystemProps,
	ErrorBoundary,
	type ErrorBoundaryProps
} from './components';
import {
	useAuthenticationContext,
	usePermissionsContext,
	type AuthenticationContextType,
	type PermissionsContextType
} from './context';
import { SessionService } from './services';
import {
	type SetupAuthenticationReturn,
	type SetupAuthenticationStorage,
	type SetupAuthenticationTokenType,
	type SetupAuthenticationType,
	setupAuthentication
} from './setupAuthentication';
import { type BasePermissionType, type BaseUserType } from './types';

export {
	AuthenticationSystem, type AuthenticationSystemProps, ErrorBoundary, type ErrorBoundaryProps,

	type AuthenticationContextType, type PermissionsContextType,

	useAuthenticationContext, usePermissionsContext,

	type BasePermissionType, type BaseUserType,

	SessionService,

	type SetupAuthenticationReturn, type SetupAuthenticationStorage, type SetupAuthenticationTokenType, type SetupAuthenticationType, setupAuthentication
};
