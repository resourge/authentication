# @resourge/react-authentication

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`@resourge/react-authentication` provides a comprehensive Authentication System built using React. It offers components and utilities for managing user authentication, authorization, and error handling within a React application. The system ensures a seamless user authentication experience with customizable error handling and permission management.

## Table of Contents

- [Installation](#installation)
- [setupAuthentication](#setupAuthentication)
- [AuthenticationSystem](#AuthenticationSystem)
- [SessionService](#SessionService)
- [ErrorBoundary](#ErrorBoundary)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add @resourge/react-authentication
```

or NPM:

```sh
npm install @resourge/react-authentication --save
```

## Usage

```tsx
import React from 'react';
import { AuthenticationSystem, setupAuthentication } from '@resourge/react-authentication';
import LoadingSpinner from './LoadingSpinner';

// Setup authentication (call outside of components)
const authentication = setupAuthentication(
  getProfile: async (token) => {
	// Perform authentication logic here
    return {
      user: { id: 123, username: 'example_user' },
      permissions: { admin: true }
    };
    // Logic to retrieve user profile based on the provided token
  },
  refreshToken: async (token, refreshToken) => {
    // Logic to refresh the authentication token
  },
  storage: localStorage
);

function App() {
  const handleAuthenticationError = (error, errorInfo) => {
    // Custom error handling logic
  };

  return (
    <AuthenticationSystem
      authentication={authentication}
      // Custom Error Handling:
      onError={handleAuthenticationError}
      // Custom Loading Component:
      loadingComponent={<LoadingSpinner />}
    >
      {/* Your application components */}
    </AuthenticationSystem>
  );
}

export default App;
```

# setupAuthentication

`setupAuthentication` provides a flexible authentication setup for web applications. It allows you to easily manage authentication tokens and user data, with optional local storage integration for token persistence.

## Usage

```tsx
import { setupAuthentication } from 'authentication-setup';

// Setup authentication (call outside of components)
const authentication = setupAuthentication({
  getProfile: async (token) => {
    // Logic to retrieve user profile based on the provided token
  },
  refreshToken: async (token, refreshToken) => {
    // Logic to refresh the authentication token
  },
  storage: {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
  },
  useSuspense: true
});
```

## API

`setupAuthentication(config)`

### Parameters

- `config`: An object containing configuration options for the authentication system.
	- `getProfile`: A function that retrieves the user profile based on the provided token.
	- `refreshToken`: Function that refreshes the authentication token.
	- `storage` (optional): An object with methods for accessing local storage. If provided, authentication tokens will be stored locally.
	- `useSuspense` (optional): Boolean indicating whether to use React Suspense for asynchronous loading. Use it if you want to show a different screen while waiting profile info. Defaults to true.


#### storage

`getItem`
Retrieves a value from local storage based on the provided key. If storage is asynchronous, it returns a promise that resolves to the value (string or null); otherwise, it returns the value synchronously. If the value is not found, it returns null.

`removeItem`
Deletes a value from local storage corresponding to the provided key. If storage is asynchronous, it returns a promise that resolves once the removal process is complete; otherwise, it performs the removal synchronously.

`setItem`
Stores a key-value pair in local storage. It takes a key and a value as parameters and returns a promise that resolves once the setting process is complete if storage is asynchronous; otherwise, it sets the key-value pair synchronously.

# AuthenticationSystem

`AuthenticationSystem` component is a react component designed to streamline the integration of authentication and error handling in your application. It combines the functionalities of an authentication provider, error boundary, and suspense fallback to enhance the user experience and simplify authentication development.

## Usage

The `AuthenticationSystem` component requires the `authentication` prop, which is an instance of `SetupAuthenticationReturn`. This prop encapsulates the authentication setup and state, including the authentication token and refresh token.

Here's how you can use the `AuthenticationSystem` component in your application:

```jsx
import { setupAuthentication, AuthenticationSystem } from '@resourge/react-authentication';

// Setup authentication (call outside of components)
const authenticationInstance = setupAuthentication({
  getProfile: async (token) => {
    // Logic to retrieve user profile based on the provided token
  },
  refreshToken: async (token, refreshToken) => {
    // Logic to refresh the authentication token
  },
  storage: {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
  },
});

<AuthenticationSystem
  authentication={authenticationInstance}
  onLogin={handleLogin}
  onLogout={handleLogout}
  onToken={handleToken}
  errorComponent={<ErrorComponent />}
  onError={handleError}
  redirectOnError={true}
>
  {/* Your application content goes here */}
</AuthenticationSystem>
```

## Props

- `authentication` (required): An instance of `SetupAuthenticationReturn` representing the authentication setup and state. It includes the authentication token and refresh token, if available.
- `onLogin`: A function to handle user login attempts. It receives the username or email and password as arguments and returns a promise that resolves to an authentication token.
- `onLogout`: A function to handle user logout. It receives the current token as an argument and returns a promise or void.
- `onToken`: A function to handle token updates. It receives the current token, user data, and permissions as arguments and returns a promise or void.
- `errorComponent`: A React element or function to be displayed when an error occurs within the AuthenticationSystem component or its children.
- `onError`: A function to handle errors that occur within the `AuthenticationSystem` component or its children. It receives the error and error info as arguments.
- `redirectOnError`: A boolean indicating whether to render the children again after an error occurs.

### useAuthenticationContext/usePermissionsContext

#### usePermissionsContext

`usePermissionsContext` hook is used to access the permissions. It provides access to the permissions data stored in the context, allowing components to read and utilize user permissions.

#### useAuthenticationContext

`useAuthenticationContext` hook is used to access the authentication. It provides access to authentication-related state and actions, such as user authentication, login, logout, token management, and error handling. This hook enables components to interact with authentication functionality seamlessly.

# SessionService

`SessionService` provides methods for managing user sessions and authentication-related functionality outside of React components and contexts. It allows you to perform authentication actions such as login, logout, token refresh, and custom error handling. Is designed to work in conjunction with the `AuthenticationSystem` component in your React application. 
_Note: Make sure you have the `AuthenticationSystem` set up before using the `SessionService`._

## Methods

- `authenticate()`: Calls the backend using the token to retrieve the user profile. Returns a promise that resolves once the authentication process is complete.
```typescript
// Example usage of authenticate method
SessionService.authenticate()
  .then(() => {
    console.log('User authenticated successfully');
  })
  .catch((error) => {
    console.error('Authentication failed:', error);
  });
```

- `login(userNameOrEmail: string, password: string)`: Initiates the user login process with the provided username or email and password. Returns a promise that resolves to a boolean indicating whether the login was successful.
```typescript
// Example usage of login method
SessionService.login('example@example.com', 'password')
  .then((isLoggedIn) => {
    if (isLoggedIn) {
      console.log('User logged in successfully');
    } else {
      console.error('Login failed: Invalid credentials');
    }
  })
  .catch((error) => {
    console.error('Login failed:', error);
  });
```

- `logout()`: Logs out the current user. Returns a promise that resolves once the logout process is complete.
```typescript
// Example usage of logout method
SessionService.logout()
  .then(() => {
    console.log('User logged out successfully');
  })
  .catch((error) => {
    console.error('Logout failed:', error);
  });
```

- `refreshToken()`: Refreshes the current authentication token. Returns a promise that resolves to a boolean indicating whether the token refresh was successful.
```typescript
// Example usage of refreshToken method
SessionService.refreshToken()
  .then((isRefreshed) => {
    if (isRefreshed) {
      console.log('Token refreshed successfully');
    } else {
      console.error('Token refresh failed: Invalid token');
    }
  })
  .catch((error) => {
    console.error('Token refresh failed:', error);
  });
```

- `setToken(token?: string | null, refreshToken?: string | null)`: Allows for manual custom login, such as with Google or Apple authentication. It accepts a token and an optional refresh token as parameters.

```typescript
// Example usage of setToken method
SessionService.setToken('yourAuthToken', 'yourRefreshToken')
.then((success) => {
  if (success) {
    console.log('Token set successfully');
  } 
  else {
    console.error('Failed to set token');
  }
})
.catch((error) => {
  console.error('Error setting token:', error);
});
```

- `setAuthenticationError(error: Error)`: Sets a custom authentication error. This method can be used to handle and manage authentication errors within your application.

```typescript
// Example usage of setAuthenticationError method
try {
  // Perform authentication process
} catch (error) {
  console.error('Authentication failed:', error);
  SessionService.setAuthenticationError(error);
}
```

- `getToken()`: Retrieves a valid token. If the token is expired, it fetches a new version.

```typescript
// Example usage of setAuthenticationError method
// Example to get current token
SessionService.getToken()
.then((token) => {
  if (token) {
    console.log('Current token:', token);
  } else {
    console.log('No token found');
  }
})
.catch((error) => {
  console.error('Error getting token:', error);
});
```

# ErrorBoundary

`ErrorBoundary` component is a higher-order component that catches javascript errors anywhere in its child component tree. It's commonly used to gracefully handle errors and display fallback UI when an error occurs during rendering, typically in production environments.

## Usage

```tsx
import { ErrorBoundary } from '@resourge/authentication'

function App() {
  return (
    <ErrorBoundary>
      {/* Your application content goes here */}
    </ErrorBoundary>
  );
}

export default App;
```

## Props

- `children` (required): The child components to be rendered within the `ErrorBoundary`.
- `errorComponent`: A custom error component to be rendered when an error occurs. It receives the error object as an argument and returns the JSX to render.
- `onError`: A callback function called on each error caught by the `ErrorBoundary`. It receives the error object and error info as arguments.
- `redirectOnError`: A boolean flag indicating whether to redirect the user to a designated error page when an error occurs. Defaults to `false`.

#### Example

```tsx
import React from 'react';
import { ErrorBoundary } from '@resourge/authentication'

function MyComponent() {
  // Simulate an error
  throw new Error('An error occurred');
}

function App() {
  return (
    <ErrorBoundary
      errorComponent={(error) => (
        <div>
          <h1>Error occurred:</h1>
          <p>{error.message}</p>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Log error to analytics service
        console.error('Error occurred:', error);
      }}
      redirectOnError={true}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}

export default App;
```

In this example, if an error occurs within the `MyComponent`, the `ErrorBoundary` will catch it, render a custom error message, and log the error to the console. Additionally, if `redirectOnError` is set to `true`, the user will be redirected to an error page instead of the `ErrorBoundary`.

## Documentation

For comprehensive documentation and usage examples, visit the [react-authentication documentation](https://resourge.vercel.app/docs/react-authentication/intro).

## Contributing

Contributions to `@resourge/react-authentication` are welcome! To contribute, please follow the [contributing guidelines](CONTRIBUTING.md).

## License

`@resourge/react-authentication` is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:
- GitHub: [Resourge](https://github.com/resourge)