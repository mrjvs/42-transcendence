import React from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../hooks/useUser';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import './UserDropdown.css';
import { useFetch } from '../../hooks/useFetch';

export function UserDropdown(props: { color?: string }) {
  const [open, setOpen] = React.useState(false);
  const userData = React.useContext(UserContext);

  const logout = useFetch({
    url: '/api/v1/auth/logout',
    method: 'POST',
  });

  React.useEffect(() => {
    if (logout.done) window.location.href = '/';
  }, [logout.done]);

  return (
    <div className={'userDropdown ' + (open ? 'open' : '')}>
      <div className="cont" onClick={() => setOpen((p) => !p)}>
        <Avatar user={userData?.user} small color={props.color} />
        <div className="name">
          <p>{userData?.user?.name || 'Unknown user'}</p>
          <Icon className="icon" type="chevron" />
        </div>
      </div>
      <div className="overlay" onClick={() => setOpen(false)} />
      <div className="menu">
        <Link to="/settings" className="menuItem">
          User settings
        </Link>
        <p onClick={() => logout.run()} className="menuItem red">
          Logout
        </p>
      </div>
    </div>
  );
}
