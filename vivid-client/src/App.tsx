import React from 'react';
import { UserContext, useUser } from './hooks/useUser';
import { RootNavigation } from './navigation/Root';

function UserProtect(props: any) {
  if (props.userData.done && !props.userData.isLoggedIn) {
    window.location.href = 'http://localhost:8080/api/v1/auth/login';
    return <p>You are not logged in</p>;
  }
  if (props.userData.error) return <p>Failed to log in</p>;
  if (props.userData.loading) return <p>Loading...</p>;
  if (!props.userData.done) return null;
  return <div>{props.children}</div>;
}

function App() {
  const userData = useUser();

  return (
    <UserContext.Provider value={userData}>
      <UserProtect userData={userData}>
        <RootNavigation />
      </UserProtect>
    </UserContext.Provider>
  );
}

export default App;
